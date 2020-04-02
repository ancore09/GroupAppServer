use LearningGroupsDB;

#ALTER TABLE lessons change DateDMY datedmy varchar(10) not null;
#ALTER TABLE lessons change Theme theme tinytext not null;
#ALTER TABLE lessons change Hometask homework text not null;
#ALTER TABLE lessons change ProfComment profcomment text;

alter table news change datedmy datedmy varchar(10);
select * from news;