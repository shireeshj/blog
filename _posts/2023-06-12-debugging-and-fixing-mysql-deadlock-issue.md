---
layout: post
title: "Debugging &amp; Fixing mysql deadlock issue"
tldr: 
modified: 2023-06-12 18:31:00 +0530
category: technology
tags: [Mysql, deadlock, Index locks, Next Key Lock, ruby, Ruby on Rails, aasm]
author: nikhil
image:
  feature: 
  credit: 
  creditlink: 
comments: 
share: 
---

Recently, during one of our tests, we encountered a deadlock issue that was reported by Sentry. The deadlock occurred while attempting to insert scores into a table after completing a candidate's test. We were initially unsure about the cause of this deadlock. Upon investigation, we discovered that it was due to the interplay of various locks in our MySQL database. In this blog post, we will deep dive into the nature of these locks, understand their impact on transactions, and present the solutions we implemented to mitigate deadlock occurrences.

#### **Understanding deadlocks**
To understand the deadlock situation, let's familiarize ourselves with the different types of locks involved, as defined by the official MySQL documentation:

**GAP Lock:**

A gap lock is a lock on a gap between index records, or a lock on the gap before the first or after the last index record. A gap might span a single index value, multiple index values, or even be empty.

*If id is not indexed or has a nonunique index, the statement does lock the preceding gap.*

**Next Key Lock:**

A next-key lock is a combination of a record lock on the index record and a gap lock on the gap before the index record. in simple words If one session has a shared or exclusive lock on record R in an index, another session cannot insert a new index record in the gap immediately before R in the index order. 

**Insert Intention Lock:**

An insert intention lock is a type of gap lock set by INSERT operations prior to row insertion. This lock signals the intent to insert in such a way that multiple transactions inserting into the same index gap need not wait for each other if they are not inserting at the same position within the gap.

#### **Problem Scenario**
In our case, we have two tables, table1 and table2, with a has_many relationship. All operations are performed on table2, which has an index on table1 as a foreign key.

**Transaction A**
{% highlight shell %}
BEGIN;
DELETE FROM table2 WHERE table2.table1_id=127;
Query OK, 1 row affected (0.00 sec)
{% endhighlight %}

Resulting data locks

{% highlight shell %}
mysql> SELECT INDEX_NAME, LOCK_TYPE,LOCK_DATA,LOCK_MODE,LOCK_STATUS, EVENT_ID FROM performance_schema.data_locks;
+-----------------------------------------+-----------+-----------+---------------+-------------+----------+
| INDEX_NAME                | LOCK_TYPE | LOCK_DATA | LOCK_MODE     | LOCK_STATUS | EVENT_ID |
+-----------------------------------------+-----------+-----------+---------------+-------------+----------+
| NULL                      | TABLE     | NULL      | IX            | GRANTED     |      408 |
| index_table2_on_table1_id | RECORD    | 127, 92   | X             | GRANTED     |      408 |
| PRIMARY                   | RECORD    | 92        | X,REC_NOT_GAP | GRANTED     |      408 |
| index_table2_on_table1_id | RECORD    | 128, 93   | X,GAP         | GRANTED     |      408 |
+-----------------------------------------+-----------+-----------+---------------+-------------+----------+
4 rows in set (0.00 sec)
{% endhighlight %}

This query acquires a gap lock on table2 and an insert intention lock on table1_id values 126 and 127.


**Transaction B**

{% highlight shell %}
BEGIN;
INSERT INTO table2(table1_id) VALUES(126);
ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction
{% endhighlight %}

Resulting data locks

{% highlight shell %}
mysql> SELECT INDEX_NAME,LOCK_TYPE,LOCK_DATA,LOCK_MODE,LOCK_STATUS, EVENT_ID FROM performance_schema.data_locks;
+-----------------------------------------+-----------+-----------+------------------------+-------------+----------+
| INDEX_NAME                  | LOCK_TYPE | LOCK_DATA | LOCK_MODE              | LOCK_STATUS | EVENT_ID |
+-----------------------------------------+-----------+-----------+------------------------+-------------+----------+
| NULL                        | TABLE     | NULL      | IX                     | GRANTED     |      351 |
| index_table2_on_table1_id   | RECORD    | 127, 92   | X,GAP,INSERT_INTENTION | WAITING     |      351 |
| NULL                        | TABLE     | NULL      | IX                     | GRANTED     |      408 |
| index_table2_on_table1_id   | RECORD    | 127, 92   | X                      | GRANTED     |      408 |
| PRIMARY                     | RECORD    | 92        | X,REC_NOT_GAP          | GRANTED     |      408 |
| index_table2_on_table1_id   | RECORD    | 128, 93   | X,GAP                  | GRANTED     |      408 |
+-----------------------------------------+-----------+-----------+------------------------+-------------+----------+
6 rows in set (0.01 sec)
{% endhighlight %}

As Transaction A holds the lock on table1_id 126 due to the gap lock, Transaction B waits for the lock. However, it eventually times out, resulting in a lock wait timeout error.

To create a deadlock, one must perform a delete query in Transaction B. Then, when attempting to insert a record in Transaction A, a deadlock error is thrown, with Transaction B becoming the victim. **This deadlock situation arises due to the conflicts in the next-key lock, preventing Transaction B from inserting the record.**

#### **In a nutshell**
Lets understood the above queries in nutshell to create a deadlock.
* Transaction A -> BEGIN;
* Transaction A -> DELETE records on table2 with table1_id=x.
* Transaction B -> BEGIN;
* Transaction B -> DELETE record on table2 with table1_id=y;
* Transaction B -> INSERT a record on table2 and table1_id is x-1.
* Transaction A -> INSERT a record on table2 and table1_id is y-1.
* A deadlock occurs, with Transaction A being the victim.


#### **Practical example of GAP lock & Next Key Lock.**
Gap lock is basically on range of values & will be aquired on a range if we try to delete a record which does not exist.

**table1**
{% highlight shell %}
+----+
| id |
+----+
| 73 |
| 74 |
| 81 |
| 82 |
+----+
{% endhighlight %}


**table2**
{% highlight shell %}
+-----+-----------+
| id  | table1_id |
+-----+-----------+
| 1   | 73        | 
| 2   | 82        |
+-----+-----------+
{% endhighlight %}

**Transaction A**
{% highlight shell %}
BEGIN;
DELETE from table2 where table1_id=75;
Query OK, 0 rows affected (0.00 sec)
{% endhighlight %}

This transaction will aquire a gap lock on range from 74-80.
this means if we try to insert new values in table2(in another session) with table1_id ranging from 74-80 it will wait until delete transaction commits.

#### **Other issues**
In addition to addressing the deadlock issues caused by gap locks, we also encountered problems related to AASM records. We were using the AASM gem, a library that manages state transitions. In our case, this library was responsible for changing the state of the test to "completed" and executing several callback functions. These operations were performed as part of a single transaction, which sometimes resulted in prolonged transaction durations and increased the likelihood of deadlocks.

**Model dummy code**

{% highlight shell %}
aasm do
  state :active, initial: true
  state :complete
  event :complete, after: [:method1, :method2, :method3] do
      transitions from: :active, to: :complete
  end
end
{% endhighlight %}

When the test is marked as complete and the state changes, all the MySQL-related queries are executed as part of a single transaction.

Due to the execution of all these methods within a single transaction, there were instances where the transaction took a considerable amount of time to complete. These prolonged transactions duration increased the risk of deadlocks occurrence and also resulted in issues related to lock wait time.


#### **FIX**

1. To fix this we moved the insertion of records as a separate transaction out of the aasm state change.
2. Optimized transaction size: We optimized the other badly written queries in the transaction.
3. Reduced transaction duration: Only limited number of queries were part of the state change transaction (to keep the transaction short).
4. We further optimized the GAP lock by avoiding unnecessary delete queries when the records were not present in the table with the corresponding ID.

#### **References**
1. <a href="https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html#innodb-gap-locks" target="_blank" style="color: blue;">Innodb Gap Lock</a>
2. <a href="https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html#innodb-next-key-locks" target="_blank" style="color: blue;">Innodb Next Key Lock</a>
3. <a href="https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html#innodb-insert-intention-locks" target="_blank" style="color: blue;">Innodb Insert Intention Lock</a>
4. <a href="https://medium.com/@tanishiking/avoid-deadlock-caused-by-a-conflict-of-transactions-that-accidentally-acquire-gap-lock-in-innodb-a114e975fd72" target="_blank" style="color: blue;">Gap lock with example medium article</a>
5. <a href="https://www.percona.com/blog/innodbs-gap-lock" target="_blank" style="color: blue;">Gap lock article by percona</a>