# GitHub activity viewer

A simple little display of Github activity.

1. Open in GitHub Pages
2. Enter a GitHub [personal access token](https://github.com/settings/tokens)
3. To add your deets, edit `users` in `users.json`
4. To change the start date, edit `from` in `users.json`
5. to add a new group, add a new json file and update script.js
   

## Uses

Perhaps in the classroom as a collaborative starter project for meetup participants.

Possible tasks:
- create a personal access token to view the results;
- add your username to the appropriate json file via a PR;
- Create new folders with your own version of the index page, js and css;
- Play with chart.js to create alternative views of the data.

Please note: storing access tokens in localStorage is not great from a security point of view, but it saves having to create backend code to access a remote API.

Also, to stop new users creating havoc, merges into main require a review.

This is really just a bit of a hack.
