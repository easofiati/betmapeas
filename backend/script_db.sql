Project "BetMapEAS" {
database_type: 'PostgreSQL'
Note: 'Database schema for the BetMapEAS sports betting tracking platform.'
}

Enum transaction_type {
deposit [note: 'Funds added to bankroll']
withdrawal [note: 'Funds removed from bankroll']
bet_win [note: 'Funds added from winning bet']
bet_loss [note: 'Funds removed from losing bet stake']
bet_push [note: 'Stake returned from pushed bet']
adjustment [note: 'Manual bankroll adjustment']
}

Enum bet_result {
pending [note: 'Bet outcome is not yet determined']
win [note: 'Bet was won']
loss [note: 'Bet was lost']
push [note: 'Bet was a push (stake returned)']
cancelled [note: 'Bet was cancelled']
}

Table users {
id integer [pk, increment]
email varchar(255) [unique, not null, note: 'User email address for authentication']
password_hash varchar(255) [not null, note: 'Hashed password for user authentication']
is_active boolean [default: true, not null, note: 'Indicates if the user account is active']
is_verified boolean [default: false, not null, note: 'Indicates if the user email has been verified']
is_admin boolean [default: false, not null, note: 'Indicates if the user has administrator privileges']
created_at timestamp [default: `now()`, not null]
updated_at timestamp [default: `now()`, not null]

indexes {
email [unique]
}

Note: 'Stores user authentication and status information.'
}

Table user_settings {
id integer [pk, increment]
user_id integer [unique, not null, ref: > users.id, note: 'User associated with these settings']
timezone varchar(50) [default: 'UTC', not null, note: 'User timezone preference']
currency varchar(10) [default: 'USD', not null, note: 'User currency preference']
language varchar(10) [default: 'en', not null, note: 'User language preference']
notification_preferences jsonb [note: 'JSON object storing notification settings']
created_at timestamp [default: `now()`, not null]
updated_at timestamp [default: `now()`, not null]

indexes {
user_id [unique]
}

Note: 'Stores user-specific application settings.'
}

Table subscription_plans {
id integer [pk, increment]
name varchar(100) [unique, not null, note: 'Name of the subscription plan']
description text [note: 'Description of the plan features']
price numeric [not null, note: 'Price of the plan']
duration_days integer [not null, note: 'Duration of the plan in days']
features jsonb [note: 'JSON object listing plan features']
is_active boolean [default: true, not null, note: 'Indicates if the plan is currently available']
created_at timestamp [default: `now()`, not null]
updated_at timestamp [default: `now()`, not null]

indexes {
name [unique]
}

Note: 'Defines available subscription plans.'
}

Table user_subscriptions {
id integer [pk, increment]
user_id integer [not null, ref: > users.id, note: 'User who holds the subscription']
plan_id integer [not null, ref: > subscription_plans.id, note: 'Subscription plan details']
start_date timestamp [not null, note: 'Date when the subscription started']
end_date timestamp [not null, note: 'Date when the subscription ends']
is_active boolean [default: true, not null, note: 'Indicates if the subscription is currently active']
created_at timestamp [default: `now()`, not null]
updated_at timestamp [default: `now()`, not null]

indexes {
user_id
plan_id
(user_id, is_active)
}

Note: 'Tracks user subscriptions to plans.'
}

Table bankrolls {
id integer [pk, increment]
user_id integer [not null, ref: > users.id, note: 'User who owns this bankroll']
name varchar(255) [not null, note: 'Name of the bankroll (e.g., Main, Side)']
initial_balance numeric [default: 0.00, not null, note: 'Initial balance when the bankroll was created']
current_balance numeric [default: 0.00, not null, note: 'Current balance of the bankroll']
currency varchar(10) [not null, note: 'Currency of the bankroll']
is_active boolean [default: true, not null, note: 'Indicates if the bankroll is active']
created_at timestamp [default: `now()`, not null]
updated_at timestamp [default: `now()`, not null]

indexes {
user_id
(user_id, name) [unique]
}

Note: 'Stores user bankrolls for tracking betting performance.'
}

Table tipsters {
id integer [pk, increment]
name varchar(255) [unique, not null, note: 'Name of the tipster']
description text [note: 'Description or bio of the tipster']
website_url varchar(255) [note: 'Optional website or profile URL for the tipster']
created_at timestamp [default: `now()`, not null]
updated_at timestamp [default: `now()`, not null]

indexes {
name [unique]
}

Note: 'Stores information about tipsters.'
}

Table categories {
id integer [pk, increment]
name varchar(255) [not null, note: 'Name of the bet category']
description text [note: 'Optional description for the category']
user_id integer [not null, ref: > users.id, note: 'User who owns this category']
created_at timestamp [default: `now()`, not null]
updated_at timestamp [default: `now()`, not null]

indexes {
user_id
(user_id, name) [unique]
}

Note: 'Stores user-defined bet categories.'
}

Table tags {
id integer [pk, increment]
user_id integer [not null, ref: > users.id, note: 'User who owns this tag']
name varchar(100) [not null, note: 'Name of the tag']
created_at timestamp [default: `now()`, not null]
updated_at timestamp [default: `now()`, not null]

indexes {
user_id
(user_id, name) [unique]
}

Note: 'Stores user-defined tags for bets.'
}

Table bets {
id integer [pk, increment]
user_id integer [not null, ref: > users.id, note: 'User who placed the bet']
bankroll_id integer [not null, ref: > bankrolls.id, note: 'Bankroll associated with this bet']
category_id integer [ref: > categories.id, note: 'Optional category for the bet']
tipster_id integer [ref: > tipsters.id, null, note: 'Optional tipster associated with this bet']
event_name varchar(255) [not null, note: 'Name of the sports event']
event_date timestamp [not null, note: 'Date and time of the event']
bet_type varchar(50) [not null, note: 'Type of bet (e.g., Single, Accumulator)']
odd numeric [not null, note: 'Odds of the bet']
stake numeric [not null, note: 'Amount staked on the bet']
result bet_result [default: 'pending', not null, note: 'Result of the bet (e.g., Win, Loss, Push, Pending)']
payout numeric [note: 'Calculated payout if the bet wins']
observations text [note: 'Optional observations about the bet']
image_reference varchar(255) [note: 'Reference to an uploaded image related to the bet']
created_at timestamp [default: `now()`, not null]
updated_at timestamp [default: `now()`, not null]

indexes {
user_id
bankroll_id
category_id
tipster_id
event_date
result
}

Note: 'Stores individual sports bets placed by users.'
}

Table bet_tags {
bet_id integer [not null, ref: > bets.id]
tag_id integer [not null, ref: > tags.id]

indexes {
(bet_id, tag_id) [pk] // Composite primary key
}

Note: 'Junction table for many-to-many relationship between bets and tags.'
}

Table transactions {
id integer [pk, increment]
user_id integer [not null, ref: > users.id, note: 'User associated with the transaction']
bankroll_id integer [not null, ref: > bankrolls.id, note: 'Bankroll affected by the transaction']
bet_id integer [ref: > bets.id, null, note: 'Optional bet associated with this transaction (e.g., win/loss payout)']
transaction_type transaction_type [not null, note: 'Type of transaction (deposit, withdrawal, bet outcome, etc.)']
amount numeric [not null, note: 'Amount of the transaction']
transaction_date timestamp [default: `now()`, not null, note: 'Date and time of the transaction']
description text [note: 'Optional description of the transaction']
created_at timestamp [default: `now()`, not null]
updated_at timestamp [default: `now()`, not null]

indexes {
user_id
bankroll_id
bet_id
transaction_type
transaction_date
}

Note: 'Records financial transactions related to user bankrolls.'
}