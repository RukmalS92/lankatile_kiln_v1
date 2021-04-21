create database kiln;
use kiln;

select date(now());
select curdate();


ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456';

create table temp_rawdata (
	id BIGINT UNSIGNED not null auto_increment primary key,
	temp_t1 int not null default 0,
    temp_t2 int not null default 0,
    temp_t3 int not null default 0,
    temp_t4 int not null default 0,
    temp_t5 int not null default 0,
    temp_t6 int not null default 0,
    temp_t7 int not null default 0,
    temp_t8 int not null default 0,
    temp_t9 int not null default 0,
    temp_t10 int not null default 0,
    logtime timestamp default current_timestamp
);
select * from temp_rawdata;
delete from temp_rawdata;
alter table temp_rawdata auto_increment = 0;

create table inv_rawdata (
	id BIGINT UNSIGNED not null auto_increment primary key,
	inv1 float not null default 0.0,
    inv2 float not null default 0.0,
    inv3 float not null default 0.0,
    timevalue int not null default 0,
    logtime timestamp default current_timestamp
);
select * from inv_rawdata;
delete from inv_rawdata;
alter table inv_rawdata auto_increment = 0;

create table temp_savedata (
	id BIGINT UNSIGNED not null auto_increment primary key,
	temp_t1 int not null default 0,
    temp_t2 int not null default 0,
    temp_t3 int not null default 0,
    temp_t4 int not null default 0,
    temp_t5 int not null default 0,
    temp_t6 int not null default 0,
    temp_t7 int not null default 0,
    temp_t8 int not null default 0,
    temp_t9 int not null default 0,
    temp_t10 int not null default 0,
    logtime timestamp default current_timestamp
);
select * from temp_savedata;
delete from temp_savedata;
insert into temp_savedata(temp_t1, temp_t2, temp_t3, temp_t4, temp_t5, temp_t6, temp_t7, temp_t8, temp_t9) values(123.6,125.5,456.6,452.1,123.1,123.3,56.6,25.3,632.2);
update temp_savedata set temp_t1 = 123 where id = 1;
select temp_t1, temp_t2, temp_t3, temp_t4, temp_t5, temp_t6, temp_t7, temp_t8, temp_t9, temp_t10 from temp_savedata where id = 1;

create table inv_savedata (
	id BIGINT UNSIGNED not null auto_increment primary key,
	inv1 float not null default 0.0,
    inv2 float not null default 0.0,
    inv3 float not null default 0.0,
    timevalue int not null default 0,
    logtime timestamp default current_timestamp
);
select * from inv_savedata;
delete from inv_savedata;
insert into inv_savedata(inv1, inv2, inv3, timevalue) values(123.6,125.5,456.6,60);
update inv_savedata set inv1 = 123 where id = 1;
select timevalue from inv_savedata;

insert into temp_rawdata(temp_t1, temp_t2, temp_t3, temp_t4, temp_t5, temp_t6, temp_t7, temp_t8, temp_t9) values(123.6,125.5,456.6,452.1,123.1,123.3,56.6,25.3,632.2);

select * from temp_rawdata where logtime between '2021-02-25 00:00:00' and '2021-02-26 00:00:00';
(select id from temp_rawdata where logtime between '2021-02-25 00:00:00' and '2021-02-26 00:00:00');

set @maxid = (select max(id) from temp_rawdata where id in (select id from temp_rawdata where logtime between '2021-03-05 00:00:00' and '2021-03-06 00:00:00'));

select * from temp_rawdata where id =  @maxid;

select * from temp_rawdata where logtime between '2021-03-02 00:00:00' and '2021-03-03 00:00:00' and id = (select max(id) from temp_rawdata);