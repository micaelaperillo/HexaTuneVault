@web @tunevault
Feature: tunevault user
    as a user
    i want to log into my account
    so i can iteract with the community



Scenario: user signing in:
    Given the Sign In page is displayed
    When the user inserts his credentials
    Then he should be inside his account
