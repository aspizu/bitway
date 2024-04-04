begin transaction;

create table if not exists User (
    ID integer primary key not null,
    Username text not null unique,
    Password text not null,
    Email text not null,
    Link text not null default "",
    Avatar text not null default "",
    Name text not null,
    Bio text not null default "",
    CreatedAt integer not null,
    LastSeenAt integer not null
);

create table if not exists UserFollower (
    ID integer primary key not null,
    Follower integer not null,
    Following integer not null,
    CreatedAt integer not null,
    foreign key (Follower) references User(ID),
    foreign key (Following) references User(ID),
    unique (Follower, Following)
);

create table if not exists Blog (
    ID integer primary key not null,
    Author integer not null,
    Title text not null,
    Content text not null,
    CreatedAt integer not null,
    foreign key (Author) references User(ID)
);

create table if not exists Startup (
    ID integer primary key not null,
    Name text not null,
    Description text not null,
    CreatedAt integer not null
);

create table if not exists StartupFollower (
    ID integer primary key not null,
    Follower integer not null,
    Following integer not null,
    CreatedAt integer not null,
    foreign key (Follower) references User(ID),
    foreign key (Following) references Startup(ID),
    unique (Follower, Following)
);

create table if not exists Founder (
    ID integer primary key not null,
    Startup integer not null,
    Founder integer not null,
    CreatedAt integer not null,
    foreign key (Startup) references Startup(ID),
    foreign key (Founder) references User(ID),
    unique (Startup, Founder)
);

end transaction;
