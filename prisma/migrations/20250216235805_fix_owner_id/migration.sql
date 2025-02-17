/*
  This migration updates the User table by setting teamOwnerId to the user's own id
  for all users who have the "team_owner" role and currently have NULL for teamOwnerId.
  
  It works by joining the User table with the join table (_UserToUserRole) and the UserRole table,
  then updates each matching user.
*/

UPDATE "User"
SET "teamOwnerId" = id
WHERE "teamOwnerId" IS NULL
  AND id IN (
    SELECT "A"
    FROM "_UserToUserRole"
    WHERE "B" IN (
      SELECT id
      FROM "UserRole"
      WHERE name = 'team_owner'
    )
  ); 