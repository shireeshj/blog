---
layout: post
title: "Migration from Paperclip to ActiveStorage"
tldr: 
modified: 2021-05-21 15:07:15 +0530
category: technology
tags: [Rails,Paperclip,ActiveStorage]
author: manish
image:
  feature: 
  credit: 
  creditlink: 
comments: 
share: 
---




_How we migrated hundreds of thousands of attachments from Paperclip to ActiveStorage without downtime._

At [eLitmus](https://www.elitmus.com), recently we migrated thousands of attachment records from [Paperclip](https://github.com/thoughtbot/paperclip) to Rails-owned [ActiveStorage](https://guides.rubyonrails.org/active_storage_overview.html). Paperclip and Active Storage solve similar problems - uploading files to cloud storage like Amazon S3, Google Cloud Storage, or Microsoft Azure Storage. In our case, we are uploading files to Amazon s3. And then attach those files to Active Records objects. So migrating from one to another is straightforward data-rewriting.

### **Why do we migrate from paperclip to active storage?**

ActiveStorage was introduced in Rails version 5.2. At the time of migration, we were at Rails version 6.0. So, we were already running behind in keeping things up to date. Active storage is a highly recommended tool for uploading files. For a long, before ActiveStorage, this functionality was provided by outside gems, including Paperclip. With the release of Active storage, Paperclip was already deprecated for some time, and we wanted to move forward with Active Storage knowing it’s not as mature as Paperclip, but it's owned by the rails' community behind it. So we were happy with that.

### **How do we migrate from paperclip to active storage?**

After reading articles on the web and the migration guide provided by the Paperclip process seemed pretty straightforward. We had around 2 Million records belonging to 16 different Active Records. In our case, we need migration that is fast and with no downtime. We had records in millions we cannot afford to wait for days to run migrations. We decided to do it in small steps. One step at a time, migrating all attachments of one Active Record. So a total of 32 Merge Requests were merged in production during this time. For each Active Record, two Merge Requests deployed because we didn’t want to have any unavailable attachments during the whole process, we split it into two steps or Merge Requests.

So both steps revolve around the Paperclip and ActiveStorage. Let us refresh our understanding of how paperclip and active storage works. Paperclip works by attaching file data to the model. At the same time, it changes the schema of the model by introducing four columns in the Active Record table. It manages rails validations based on size and presence of file data if required. 

{% highlight ruby %}
  create_table "users", force: :cascade do |t|
    t.string "image_file_name"
    t.string "image_content_type"
    t.integer "image_file_size"
    t.datetime "image_updated_at"
  end
{% endhighlight %}

Here's how it would go for a `User` with an `image`, that is this in Paperclip:

{% highlight ruby %}
  class User < ApplicationRecord
    has_attached_file :image

    validates_attachment :avatar, presence: true,
      content_type: "image/jpeg",
      size: { in: 0..10.kilobytes }
  end
{% endhighlight %}


On another side, we start by installing ActiveStorage. Normally, Rails 6.1 already comes with it, so all we need is run:

{% highlight ruby %}
  rails active_storage:install
{% endhighlight %}

ActiveStorage creates three database tables ActiveStorageBlobs table storing attachment metadata, the ActiveStorageAttachments table, which is a polymorphic table between the blobs table and rails model and the ActiveStorageVariantRecords table tracks the presence of variant in the database. ActiveStorage doesn’t come with validations. we found some outside gems, including [active_storage_validations](https://github.com/igorkasyanchuk/active_storage_validations) which works for us.

{% highlight ruby %}
  create_table :active_storage_blobs do |t|
    t.string   :key,      null: false
    t.string   :filename,     null: false
    t.string   :content_type
    t.text     :metadata
    t.string   :service_name, null: false
    t.bigint   :byte_size,    null: false
    t.string   :checksum,     null: false
    t.datetime :created_at,   null: false

    t.index [ :key ], unique: true
  end

  create_table :active_storage_attachments do |t|
    t.string     :name,     null: false
    t.references :record,   null: false, polymorphic: true, index: false
    t.references :blob,     null: false

    t.datetime :created_at, null: false

    t.index [ :record_type, :record_id, :name, :blob_id ], name: "index_active_storage_attachments_uniqueness", unique: true
    t.foreign_key :active_storage_blobs, column: :blob_id
  end

  create_table :active_storage_variant_records do |t|
    t.belongs_to :blob, null: false, index: false
    t.string :variation_digest, null: false

    t.index %i[ blob_id variation_digest ], name: "index_active_storage_variant_records_uniqueness", unique: true
    t.foreign_key :active_storage_blobs, column: :blob_id
  end
{% endhighlight %}

Here's how it would go for a `User` with an `image`, that is this in ActiveStorage:

{% highlight ruby %}
  class User < ApplicationRecord
    has_one_attached :image

    validates :image, attached: true, 
      content_type: 'image/png',
      size: { in: 0..10.kilobytes }
  end
{% endhighlight %}


Let’s deep dive into the two steps we adopted, **Migrated Paperclip** data and **Adopted ActiveStorage**

#### **Migrated Paperclip Data**

In this step, we did the most crucial part of the process, running a rake job to migrate paperclip data to active storage tables. We kept everything from the Paperclip as it is and, we also added support for Active Storage. We were using both functionalities at the same time. During the time, attachments for the model were migrated from Paperclip to ActiveStorage if a user decides to upload any attachments, the user still uses the paperclip implementation, but in the background after the successful commit of all transaction related to Paperclip. We were duplicating the same attachment to active storage by using Active Record Callback after_commit.

#### **What does our rake task flow look like?**

In this step, we created a rake task that copies all the data produced by Paperclip to the new ActiveStorage format.

- Firstly, we pushed every column_name matching the Regex containing the file_name into the array. For example, we have a UserSignature model having a column image_file_name.
- Secondly, for each instance of the model, created an ActiveStorage record only if ActiveStorage doesn’t contain a record for that instance. The reason for this is that for some reason, we cancel our rake task or it gets crashes, we had a choice to restart it from the place where it left off.
- So for each instance, we were first constructing the direct URL of the attachment. Direct URL is the Amazon s3 URL to download the attachment from Amazon s3. We then pass on this direct URL to ActiveStorage::Blob create_and_upload! Method, which first downloads it and re-upload it to the s3 bucket. We then created the associated polymorphic ActiveStorage record.

#### **What challenges did we face running rake tasks?**

At eLitmus, models with CDN bucket configurations have less than 20 thousand records. For models with a limited number of records above approach works well for us. It looks quite straightforward for us. As soon we started migrating the Default bucket, with each model with records greater than 50,000, problems came arising. We started with records in increasing order of their count. For the Default bucket, we started our journey with 56,000 records by following the approach mentioned above. It took around more than 4 hours to migrate 56,000 in a staging environment. We can’t afford to wait for hours to migrate 56,000 attachments. So we had to come up with a different approach and, this is where things become interesting. 

After all the specs, we found that in the above approach, we have an open URI to download the attachment from Amazon s3 and re-upload it to the s3 bucket in the transaction that prolonged the database connection time. We came up with a different approach by designing our rake task; in such a way that instead of hitting s3 of every record, we decided to just come up with a database migration that copies all of the data generated from the paperclip to the new Active Storage required format. Paperclip adds attachment columns directly to the model’s tables such as image_file_name, image_content_type, image_updated_at, image_file_size. ActiveStorage stores this information in two dedicated tables ActiveStorageBlobs table and ActiveStorageAttachments table.

We loop through the records of the model and then through each attachment definition within the model. If the model record doesn’t have an uploaded attachment, skip to the next record. Otherwise, we converted the Paperclip data to ActiveStorage records. We set the values for the new ActiveStorage records based on the data from Paperclip’s field for the ActiveStorageBlobs table.

For the records with limited numbers, less than 1,00,000 approach works well for us. It took only 8 minutes to migrate 96,000 records. Our next target was to migrate around 4,50,000 migrate. We started migrating with the same approach we used for 96,00,000. But things do not go as straightforward. While migrating 4,50,000 maximum number of records in our Paperclip data had missing file size. As ActiveStorageBlobs table byte_size is the required field, We had to hit s3 API to fetch file size. It took around 4 hours in staging to migrate. On optimizing the rake task, we came up with another approach instead of reading data from a Paperclip column and then writing them to ActiveStorageBlobs at, same time. We decided to first read all the data from the Paperclip and then write it back to ActiveStorage. Firstly we read all the data from paperclip model columns and made them compatible with ActiveStorage Required format in CSV. Then we write data from CSV to ActiveStorage tables. It took 2 hours for us to migrate 4,50,000 records in production.
With the same approach next, we migrated around 14,00,000 records and, it took 45 minutes in staging and 18 hours in production.

#### **Adopted Active Storage**

After the job finished, we removed everything related to the paperclip and replaced its usage with active storage.  We updated config files, added Amazon s3 storage definitions to storage.yml, and removed paperclip configuration for attachments related to the model. Updated model, views, and controllers related to Active Record. The red, green, and refactor approach helped us to improve confidence that our code was working as expected.

#### **What challenges did we face during migration?**

- Paperclip provides us several validators to validate our attachments. Out of the box, ActiveStorage doesn’t come with validations. We need to write custom validations in ActiveStorage, to add simple validations for attachments to validate presence, content type, attachment size. After some research, we found some outside gems, including [active_storage_validations](https://github.com/igorkasyanchuk/active_storage_validations), provide us validators as Paperclip. As ActiveStorage is evolving day by day, validations are on the to-do list of the rails community. As soon as it is released, we will be ready to get the outside gem replaced.
- At eLitmus, we were using two Amazon s3 buckets - default bucket and CDN bucket, to store our attachments. Paperclip provides us functionality to store attachments on different buckets by giving an option bucket name while uploading attachment data. We started migrating from Paperclip to ActiveStorage with our application rails version 6.0. In Rails 6.0, there was no such tool to categorize the bucket name while uploading an attachment. Almost half of the models in our application are using CDN bucket, and the rest are using default bucket. The Rails community is behind the ActiveStorage in the rails version 6.1 service column was introduced in the ActiveStorageBlobs table for categorizing the bucket name while uploading an attachment. So we migrated the first CDN bucket attachment with rails version 6.0. Then we upgraded our rails version to 6.1 and migrated the other half records to the default bucket.
- After the migration of 14,00,000 records after a week, we encountered a bug in production around 500, records key were missing from the amazon s3 bucket. After few hours of debugging, we found that between the time,  1st and 2nd MR’s merge in production. During, this period we kept everything from the paperclip as it is we, also added support for Active Storage. We were using both functionalities at the same time. During the time attachment for the model were migrated from paperclip to active storage, if a user decides to upload any attachments, the user still uses the paperclip implementation, but in the background after the successful commit of all transaction related to paperclip. We were duplicating the same attachment to active storage by using Active Record Callback after_commit. We produce the bug when the user uploads the attachment with the same filename as in our database before the migration process. We accidentally deleted the record’s key from amazon s3. After specs and debugging we, came up with a solution to recover these deleted files from amazon s3. We created a new rake task for recovering the deleted files from s3 by deleting the latest delete markers version for the key from s3. And all files were successfully recovered and working fine now on production.

### **Conclusion**

ActiveStorage has now been in production for over a week, and it’s been seamless. It provided us everything we needed though they are certainly more things that need to be evolved validations for attachments, supporting directory structure for active storage blob key. Looking Forward to seeing active storage evolve. And this will conclude our journey regarding migration from paperclip to ActiveStorage.