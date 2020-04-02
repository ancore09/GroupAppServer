use LearningGroupsDB;

#insert into lessons (group_id, datedmy, theme, hometask, profcomment) values (
#	1,
#	'25T03T2020',
#    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
#    'Suspendisse rutrum, leo vitae ornare volutpat, risus lectus congue lacus, sed ultricies urna enim fringilla est. Maecenas semper enim velit, non vulputate ipsum porttitor nec. Nulla venenatis, quam nec lacinia facilisis, nulla metus tincidunt ex, non vehicula urna tellus at lacus.',
#    'Sed fringilla felis velit, laoreet bibendum ex ullamcorper eget.'
#);

#SELECT * FROM lessons WHERE ID = (SELECT Lesson_ID FROM evaluating WHERE ID = (SELECT Evaluation_ID FROM learning WHERE User_ID = (SELECT ID FROM users WHERE Login = 'rollingworld')));
#delete from lessons where id = 1;
#ALTER TABLE lessons AUTO_INCREMENT=1;
#ALTER TABLE lessons ADD group_id int NOT NULL AFTER ID

select * from lessons;