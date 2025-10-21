# Database Migrations

This directory contains SQL migration files for Supabase.

## Usage

Each migration file contains SQL statements that you can copy and paste into the Supabase SQL Editor.

## Naming Convention

Use the following naming convention for migration files:

```
XXX_descriptive_name.sql
```

Where:
- `XXX` is a sequential number (001, 002, 003, etc.)
- `descriptive_name` describes what the migration does

## Example

```
001_create_users_table.sql
002_add_user_roles.sql
003_create_patients_table.sql
```

## Best Practices

1. Keep migrations small and focused
2. Test migrations in a development environment first
3. Include both up and down migration logic when possible
4. Document complex migrations with comments
5. Never edit existing migration files after they've been applied

