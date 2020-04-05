use LearningGroupsDB;

#ALTER TABLE lessons change DateDMY datedmy varchar(10) not null;
#ALTER TABLE lessons change Theme theme tinytext not null;
#ALTER TABLE lessons change Hometask homework text not null;
#ALTER TABLE lessons change ProfComment profcomment text;

#alter table news change filehash filehash varchar(36);
select * from news;