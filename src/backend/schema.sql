begin transaction;

create table if not exists User (
    ID integer primary key not null,
    Username text not null unique,
    Password text not null,
    Name text not null,
    Email text not null,
    Avatar text not null,
    Bio text not null,
    Link text not null,
    CreatedAt integer not null,
    LastSeenAt integer not null
) strict;

create table if not exists UserFollower (
    ID integer primary key not null,
    Follower integer not null,
    Following integer not null,
    CreatedAt integer not null,
    foreign key (Follower) references User(ID) on delete cascade,
    foreign key (Following) references User(ID) on delete cascade,
    unique (Follower, Following)
) strict;

create table if not exists Blog (
    ID integer primary key not null,
    Author integer not null,
    Title text not null,
    Content text not null,
    IsPoll integer not null,
    CreatedAt integer not null,
    foreign key (Author) references User(ID) on delete cascade
) strict;

create table if not exists PollOption (
    ID integer primary key not null,
    Blog integer not null,
    Option text not null,
    foreign key (Blog) references Blog(ID) on delete cascade,
    unique (Blog, Option)
) strict;

create table if not exists PollVote (
    ID integer primary key not null,
    Blog integer not null,
    Voter integer not null,
    Option integer not null,
    foreign key (Blog) references Blog(ID) on delete cascade,
    foreign key (Voter) references User(ID) on delete cascade,
    foreign key (Option) references PollOption(ID) on delete cascade,
    unique (Blog, Voter, Option)
) strict;

create table if not exists Startup (
    ID integer primary key not null,
    Name text not null,
    Description text not null,
    Banner text not null,
    FoundedAt integer not null,
    CreatedAt integer not null
) strict;

create table if not exists StartupFollower (
    ID integer primary key not null,
    Follower integer not null,
    Following integer not null,
    CreatedAt integer not null,
    foreign key (Follower) references User(ID) on delete cascade,
    foreign key (Following) references Startup(ID) on delete cascade,
    unique (Follower, Following)
) strict;

create table if not exists Founder (
    ID integer primary key not null,
    Keynote text not null default '',
    Startup integer not null,
    Founder integer not null,
    FoundedAt integer not null,
    CreatedAt integer not null,
    foreign key (Startup) references Startup(ID) on delete cascade,
    foreign key (Founder) references User(ID) on delete cascade,
    unique (Startup, Founder)
) strict;

end transaction;
