class User {
  constructor(client, userID, username, password, email, mobileNumber, receiveNotification, followArray, recommendationArray, referralCode, referralPoints, referralClaim, rewardArray, wishlistArray) {
    this.client = client;
    this.userID = userID;
    this.username = username;
    this.password = password;
    this.email = email;
    this.mobileNumber = mobileNumber;
    this.receiveNotification = receiveNotification;
    this.followArray = followArray;
    this.recommendationArray = recommendationArray;
    this.referralCode = referralCode;
    this.referralPoints = referralPoints;
    this.referralClaim = referralClaim;
    this.rewardArray = rewardArray;
    this.wishlistArray = wishlistArray;
  }

  async login(res, username, password) {
    try {
      const db = this.client.db('FreshBearNearMe');
      const collection = db.collection('User');
      //Find a data that matches the username and password
      const result = await collection.findOne({ username, password });

      if (result) {
        this.userID = result.userID;
        this.email = result.email;
        this.mobileNumber = result.mobileNumber;
        this.receiveNotification = result.receiveNotification;
        this.followArray = result.followArray;
        this.recommendationArray = result.recommendationArray;
        this.referralCode = result.referralCode;
        this.referralPoints = result.referralPoints;
        this.referralClaim = result.referralClaim;
        this.rewardArray = result.rewardArray;
        this.wishlistArray = result.wishlistArray;

        //Create a session token
        const sessionToken = 'testtoken123';

        //Set the session token in a cookie
        res.cookie('sessionToken', sessionToken, { httpOnly: true });

        //Set the username in a separate cookie
        res.cookie('username', result.username, { httpOnly: true });

        //Set object id in a separate cookie
        res.cookie('userID', result.userID, { httpOnly: true});
        
        res.json({ success: true, userID: result.userID, username: result.username });
      } else {
        res.json({ success: false, message: 'Invalid username or password' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
    }
  }

  async getUserData(req, res) {
    const { userID } = req.body;

    try {
      const db = this.client.db('FreshBearNearMe');
      const collection = db.collection('User');
      //Find the user document that matches the provided userID
      const user = await collection.findOne({ userID });
      if (user) {
        //Extract the necessary data from the user document
        const { username, email, mobileNumber, password, receiveNotification } = user;
        //Send the user data as the response
        res.json({ success: true, username, email, mobileNumber, password, receiveNotification });
      } else {
        res.json({ success: false, message: 'User not found' });
      }
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).json({ success: false, message: 'An error occurred while retrieving user data' });
    }
  }

  async editProfile(res, oldData, newData) {
    try {
      const db = this.client.db('FreshBearNearMe');
      const collection = db.collection('User');
      
      // Check if the old data exists in the database
      const existingUser = await collection.findOne({ userID: oldData.userID });
  
      if (existingUser) {
        // Update the user's profile in the database
        const result = await collection.updateOne(
          { userID: oldData.userID }, // Use userID as the filter
          { $set: newData }
        );
  
        if (result.modifiedCount > 0) {
          // Profile update successful
          res.json({ success: true, message: 'Profile updated successfully' });
        } else {
          // No changes made
          res.json({ success: false, message: 'No changes made to the profile' });
        }
      } else {
        // User not found in the database
        res.json({ success: false, message: 'User not found' });
      }
    } catch (error) {
      console.error('Error during profile update:', error);
      res.status(500).json({ success: false, message: 'An error occurred during profile update' });
    }
  }

  async getFeed(client, res, userID) {
    try {
      const db = client.db("FreshBearNearMe");
      const feedData = await db.collection("Reviews").find().toArray();
      const promises = feedData.map(async (data) => {
        const user = await db.collection("User").findOne({ userID: data.reviewUser });
        if (user) {
          data.reviewUsername = user.username;
        }
        
        const venue = await db.collection("Venue").findOne({ venueReview: data.reviewID });
        if (venue) {
          data.feedImage = venue.venueImage;
        } else {
          const beer = await db.collection("Beer").findOne({ communityReview: data.reviewID });
          if (beer) {
            data.feedImage = beer.beerImage;
          }
        }
        
        return data;
      });
  
      const updatedFeedData = await Promise.all(promises);
  
      const user2 = await db.collection("User").findOne({ userID: parseInt(userID) });
      if (user2) {
        updatedFeedData.forEach((data) => {
          data.followArray = user2.followArray;
          data.isFollowing = data.followArray.includes(data.reviewUser) || data.reviewUser === parseInt(userID);
        });
      }
      res.json({ reviews: updatedFeedData });
    } catch (error) {
      res.status(500).json({ error: "Error retrieving feed" });
    }
  }

  async followUser(client, res, userID, reviewUserID) {
    try {
      const db = client.db('FreshBearNearMe');
      const collection = db.collection('User');
  
      const userToFollow = await collection.findOne({ userID: reviewUserID });
  
      if (userToFollow) {
        const currentUser = await collection.findOne({ userID });
  
        if (currentUser) {
          if (!currentUser.followArray.includes(reviewUserID)) {
            currentUser.followArray.push(reviewUserID);
            const result = await collection.updateOne(
              { userID },
              { $set: { followArray: currentUser.followArray } }
            );
            res.json({ success: true, message: `You are now following user with ID ${reviewUserID}` });
          } else {
            res.json({ success: false, message: `You are already following user with ID ${reviewUserID}` });
          }
        } else {
          res.json({ success: false, message: 'Current user not found' });
        }
      } else {
        res.json({ success: false, message: 'User to follow not found' });
      }
    } catch (error) {
      console.error('Error during followUser:', error);
      res.status(500).json({ success: false, message: 'An error occurred during followUser' });
    }
  }

  async unfollowUser(client, res, userID, reviewUserID) {
    try {
      const db = client.db('FreshBearNearMe');
      const collection = db.collection('User');
  
      const userToUnfollow = await collection.findOne({ userID: reviewUserID });
  
      if (userToUnfollow) {
        const currentUser = await collection.findOne({ userID });
  
        if (currentUser) {
          const reviewUserIndex = currentUser.followArray.indexOf(reviewUserID);
  
          if (reviewUserIndex !== -1) {
            currentUser.followArray.splice(reviewUserIndex, 1);
            const result = await collection.updateOne(
              { userID },
              { $set: { followArray: currentUser.followArray } }
            );
            res.json({ success: true, message: `You have unfollowed user with ID ${reviewUserID}` });
          } else {
            res.json({ success: false, message: `You were not following user with ID ${reviewUserID}` });
          }
        } else {
          res.json({ success: false, message: 'Current user not found' });
        }
      } else {
        res.json({ success: false, message: 'User to unfollow not found' });
      }
    } catch (error) {
      console.error('Error during unfollowUser:', error);
      res.status(500).json({ success: false, message: 'An error occurred during unfollowUser' });
    }
  }

  async getRecommendation(client, res, userID) {
    const db = client.db("FreshBearNearMe");
    const userData = await db.collection("User").findOne({ userID: parseInt(userID) });
    const userDataFollowingArray = userData.followArray;
  
    const recommendationData = await db.collection("Recommendation").find({
      recommendationUser: { $in: userDataFollowingArray }
    }).toArray();
  
    const userRecommendations = {};
  
    const userNames = await db.collection("User").find(
      { userID: { $in: userDataFollowingArray } },
      { projection: { _id: 0, userID: 1, username: 1 } }
    ).toArray();
  
    const userNameMap = {};
    userNames.forEach(user => {
      userNameMap[user.userID] = user.username;
    });
  
    for (const recommendation of recommendationData) {
      const user = recommendation.recommendationUser;
      if (!userRecommendations[userNameMap[user]]) {
        userRecommendations[userNameMap[user]] = [];
      }
  
      if (recommendation.recommendationType === 'Venue') {
        const venueID = recommendation.recommendationItem;
        const venueData = await db.collection("Venue").findOne({ venueID: venueID });
        userRecommendations[userNameMap[user]].push(venueData);
      } else if (recommendation.recommendationType === 'Beer') {
        const beerID = recommendation.recommendationItem;
        const beerData = await db.collection("Beer").findOne({ beerID: beerID });
        userRecommendations[userNameMap[user]].push(beerData);
      }
    }
    res.send(userRecommendations);
  }

  async submitRecommendation(client, res, recommendationType, recommendationUser, recommendationName) {
    try {
        const db = client.db('FreshBearNearMe'); 
        const recommendationCollection = db.collection('Recommendation');
        const beerCollection = db.collection('Beer');
        const venueCollection = db.collection('Venue');

        const existingRecommendation = await recommendationCollection.findOne({
            recommendationUser,
            recommendationType,
            recommendationItem: { $exists: true }
        });

        if (existingRecommendation) {
            return res.json({ success: false, message: 'Recommendation already exists' });
        }

        let recommendationID;
        const highestRecommendation = await recommendationCollection.find().sort({ recommendationID: -1 }).limit(1).toArray();
        if (highestRecommendation.length === 0) {
            recommendationID = 1;
        } else {
            recommendationID = highestRecommendation[0].recommendationID + 1;
        }

        let recommendationItemID;
        if (recommendationType === 'Beer') {
            const beer = await beerCollection.findOne({ beerName: recommendationName });
            if (!beer) {
                return res.json({ success: false, message: 'Beer not found' });
            }
            recommendationItemID = beer.beerID;
        } else if (recommendationType === 'Venue') {
            const venue = await venueCollection.findOne({ venueName: recommendationName });
            if (!venue) {
                return res.json({ success: false, message: 'Venue not found' });
            }
            recommendationItemID = venue.venueID;
        } else {
            return res.json({ success: false, message: 'Invalid recommendationType' });
        }

        const newRecommendation = {
            recommendationID,
            recommendationType,
            recommendationUser,
            recommendationItem: recommendationItemID,
        };

        await recommendationCollection.insertOne(newRecommendation);

        return res.json({ success: true, message: 'Recommendation submitted successfully' });
    } catch (error) {
        console.error('Error submitting recommendation:', error);
        return res.json({ success: false, message: 'Internal server error' });
    }
  }

  async getSearch(client, res) {
    try {
      const db = client.db("FreshBearNearMe");
      const venues = await db.collection("Venue").find().toArray();
      const beers = await db.collection("Beer").find().toArray();
      
      const searchData = { venues, beers };
      
      res.json(searchData);
    } catch (error) {
      console.error('Error during search:', error);
      res.status(500).json({ success: false, message: 'An error occurred during search' });
    }
  }

  async getReferralCode(client, res, userID) {
    try {
      const db = client.db("FreshBearNearMe");
      const usersCollection = db.collection("User");
      const rewardsCollection = db.collection("Rewards");
  
      const user = await usersCollection.findOne({ userID: parseInt(userID) });
  
      if (user) {
        const { referralCode, referralPoints, rewardArray } = user;
        const rewardIDCountMap = new Map();
        rewardArray.forEach(rewardID => {
          rewardIDCountMap.set(rewardID, (rewardIDCountMap.get(rewardID) || 0) + 1);
        });
  
        const rewardData = await rewardsCollection
          .find({ rewardID: { $in: Array.from(rewardIDCountMap.keys()) } })
          .toArray();
  
        const expandedRewardData = rewardData.flatMap(reward => {
          const count = rewardIDCountMap.get(reward.rewardID);
          return Array.from({ length: count }, () => reward);
        });
  
        res.json({ success: true, referralCode, referralPoints, rewardData: expandedRewardData });
      } else {
        res.json({ success: false, message: "User not found" });
      }
    } catch (error) {
      console.error("Error retrieving referral data:", error);
      res.status(500).json({ success: false, message: "An error occurred while retrieving referral data" });
    }
  }

  async submitReferralCode(client, res, userID, referralCode) {
    try {
      const currentUserID = userID;
      const db = client.db('FreshBearNearMe');
      const collection = db.collection('User');
      const user = await collection.findOne({ referralCode: referralCode });
  
      if (user) {
        const { userID, username, referralPoints, referralClaim } = user;
  
        if (referralClaim && referralClaim.includes(currentUserID)) {
          return res.json({ success: false, message: 'You have already claimed this referral code' });
        }
        
        if (currentUserID === userID) {
          return res.json({ success: false, message: 'You cannot claim your own referral code' });
        }
  
        const updatedReferralPoints = referralPoints + 50;
        await collection.updateOne(
          { userID: userID },
          { $set: { referralPoints: updatedReferralPoints }, $push: { referralClaim: currentUserID } }
        );
  
        const currentUser = await collection.findOne({ userID: currentUserID });
        if (currentUser) {
          const { referralPoints } = currentUser;
          const updatedReferralPoints2 = referralPoints + 50;
          await collection.updateOne(
            { userID: currentUserID },
            { $set: { referralPoints: updatedReferralPoints2 } }
          );
        }
  
        res.json({ success: true, username });
      } else {
        res.json({ success: false, message: 'Invalid referral code' });
      }
    } catch (error) {
      console.error('Error during referral code submission:', error);
      res.status(500).json({ success: false, message: 'An error occurred during referral code submission' });
    }
  }
  
  async getRewards(client, res) {
    try { 
      const db = client.db('FreshBearNearMe');
      const rewards = await db.collection('Rewards').find().toArray();
      res.json({rewards})
    } catch (error) {
      console.error('Error retrieving Rewards:', error);
    }
  }

  async redeemRewards(client, res, userID, rewardID, rewardPrice) {
    try {
      const db = client.db('FreshBearNearMe');
      const usersCollection = db.collection('User');
  
      const user = await usersCollection.findOne({ userID: userID });
  
      if (!user) {
        return res.json({ success: false, message: 'User not found' });
      }
      if (user.referralPoints >= rewardPrice) {
        const result = await usersCollection.updateOne(
          { userID: userID },
          {
            $push: { rewardArray: rewardID },
            $inc: { referralPoints: -rewardPrice },
          }
        );
  
        if (result.modifiedCount === 1) {
          return res.json({ success: true });
        } else {
          return res.json({ success: false, message: 'Failed to update user document' });
        }
      } else {
        return res.json({ success: false, message: 'Insufficient points to redeem the reward' });
      }
    } catch (error) {
      console.error('Error trying to claim rewards:', error);
      return res.status(500).json({ error: 'Failed to claim rewards' });
    }
  }

  async getPosts(client, res) {
    try {
      const db = client.db('FreshBearNearMe');
      const posts = await db.collection('Post').find().toArray();
      const commentCollection = db.collection('Comment');
  
      const postsWithUsernameAndComments = [];
  
      for (const post of posts) {
        const userID = post.postUser;
        const user = await db.collection('User').findOne({ userID: userID }, { projection: { username: 1 } });
        if (user && user.username) {
          post.username = user.username;
        } else {
          post.username = 'Unknown User';
        }
  
        const comments = await commentCollection
          .find({ commentID: { $in: post.postCommentArray } })
          .toArray();
  
        const commentsWithUsername = [];
  
        for (const comment of comments) {
          const commentUser = comment.commentUser;
          const commentUserObj = await db.collection('User').findOne({ userID: commentUser }, { projection: { username: 1 } });
          if (commentUserObj && commentUserObj.username) {
            comment.username = commentUserObj.username;
          } else {
            comment.username = 'Unknown User';
          }
          commentsWithUsername.push(comment);
        }
  
        post.comments = commentsWithUsername;
  
        postsWithUsernameAndComments.push(post);
      }
  
      res.json({ posts: postsWithUsernameAndComments });
    } catch (error) {
      console.error('Error retrieving Posts:', error);
    }
  }

  async submitComment(client, res, userID, postID, commentDescription, commentDate) {
    try {
      const db = client.db('FreshBearNearMe');
      const commentCollection = db.collection('Comment');
      const postCollection = db.collection('Post');
  
      const latestComment = await commentCollection.findOne({}, { sort: { commentID: -1 }, projection: { commentID: 1 } });
      const latestCommentID = latestComment ? latestComment.commentID : 0;
      const newCommentID = latestCommentID + 1;
  
      const newComment = {
        commentID: newCommentID,
        commentUser: userID,
        commentDate: commentDate,
        commentDescription: commentDescription,
      };
  
      await commentCollection.insertOne(newComment);
  
      await postCollection.updateOne({ postID: postID }, { $push: { postCommentArray: newCommentID } });
  
      res.json({ success: true, message: 'Successfully submitted comment' });
    } catch (error) {
      console.error('Error submitting comment:', error);
      res.status(500).json({ success: false, message: 'Failed to submit comment' });
    }
  }

  async submitPost(client, res, userID, postTitle, postDate, postDescription) {
    try {
      const db = client.db('FreshBearNearMe');
      const postCollection = db.collection('Post');
  
      const latestPost = await postCollection.findOne({}, { sort: { postID: -1 }, projection: { postID: 1 } });
      const latestPostID = latestPost ? latestPost.postID : 0;
      const newPostID = latestPostID + 1;
  
      const newPost = {
        postID: newPostID,
        postUser: userID,
        postTitle: postTitle,
        postCommentArray: [], 
        postDate: postDate,
        postDescription: postDescription,
      };
  
      await postCollection.insertOne(newPost);
  
      res.json({ success: true, message: 'Successfully submitted post' });
    } catch (error) {
      console.error('Error submitting post:', error);
      res.status(500).json({ success: false, message: 'Failed to submit post' });
    }
  }

  async addToWishlist(client, res, beerID, venueID, userID) {
    try {
      const db = client.db("FreshBearNearMe");
      const usersCollection = db.collection("User");
      const user = await usersCollection.findOne({ userID });
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      let itemToAdd = {};
      if (beerID !== undefined) {
        itemToAdd = { beerID: beerID };
      } else if (venueID !== undefined) {
        itemToAdd = { venueID: venueID };
      } else {
        return res.status(400).json({ success: false, message: "Invalid input" });
      }
  
      const beerExistsInWishlist = user.wishlistArray.some(
        (item) => (beerID !== undefined && item.beerID === beerID) || (venueID !== undefined && item.venueID === venueID)
      );
  
      if (beerExistsInWishlist) {
        return res.status(200).json({ success: false, message: "Item already in wishlist" });
      }
  
      await usersCollection.updateOne(
        { userID },
        { $push: { wishlistArray: itemToAdd } }
      );
  
      return res.status(200).json({ success: true, message: "Item added to wishlist successfully" });
    } catch (error) {
      console.error("Error adding item to wishlist:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  async getWishlist(client, res, userID) {
    try {
      const db = client.db("FreshBearNearMe");
      const usersCollection = db.collection("User");
      const venuesCollection = db.collection("Venue");
      const beersCollection = db.collection("Beer");
  
      const user = await usersCollection.findOne({ userID: parseInt(userID) });
  
      if (!user) {
        return res.json({ success: false, message: "User not found" });
      }
  
      const wishlistArray = user.wishlistArray;
      const matchingData = [];
  
      for (const item of wishlistArray) {
        if (item.hasOwnProperty("venueID")) {
          const venueID = item.venueID;
          const venue = await venuesCollection.findOne({ venueID: venueID });
  
          if (venue) {
            matchingData.push(venue);
          }
        } else if (item.hasOwnProperty("beerID")) {
          const beerID = item.beerID;
          const beer = await beersCollection.findOne({ beerID: beerID });
  
          if (beer) {
            matchingData.push(beer);
          }
        }
      }
  
      return res.json({ wishlistArray: matchingData });
    } catch (error) {
      console.error("Error getting wishlist:", error);
      return res.json({ success: false, message: "Internal server error" });
    }
  }

  async removeWishlist(client, res, beerID, venueID, userID) {
    try {
      const db = client.db("FreshBearNearMe");
      const usersCollection = db.collection("User");
      const user = await usersCollection.findOne({ userID: parseInt(userID) });
  
      if (!user) {
        return res.json({ success: false, message: "User not found" });
      }
  
      const wishlistArray = user.wishlistArray;
      const index = wishlistArray.findIndex(
        (item) => (item.beerID && item.beerID === beerID) || (item.venueID && item.venueID === venueID)
      );
  
      if (index === -1) {
        return res.json({ success: false, message: "Item not found in wishlist" });
      }
  
      wishlistArray.splice(index, 1);

      await usersCollection.updateOne(
        { userID: parseInt(userID) },
        { $set: { wishlistArray: wishlistArray } }
      );
  
      return res.json({ success: true, message: "Item removed from wishlist" });
    } catch (error) {
      console.error("Error removing item from wishlist:", error);
      return res.json({ success: false, message: "Internal server error" });
    }
  }

  async submitIssue(client, res, userID, issueDate, issueDescription) {
    try {
      const db = client.db('FreshBearNearMe');
      const issueCollection = db.collection('Issue');
  
      const latestIssue = await issueCollection.findOne({}, { sort: { issueID: -1 }, projection: { issueID: 1 } });
      const latestIssueID = latestIssue ? latestIssue.issueID : 0;
      const newIssueID = latestIssueID + 1;
  
      const newIssue = {
        issueID: newIssueID,
        issueUser: userID,
        issueDate: issueDate,
        issueDescription: issueDescription,
        issueStatus: false,
      };
  
      await issueCollection.insertOne(newIssue);
  
      res.json({ success: true, message: 'Successfully submitted issue' });
    } catch (error) {
      console.error('Error submitting issue:', error);
      res.status(500).json({ success: false, message: 'Failed to submit issue' });
    }
  }

  async submitFeedback(client, res, userID, venueName, feedbackDate, feedbackDescription) {
    try {
      const db = client.db('FreshBearNearMe');
      const feedbackCollection = db.collection('Feedback');
      const venueCollection = db.collection('Venue');
  
      const latestFeedback = await feedbackCollection.findOne({}, { sort: { feedbackID: -1 }, projection: { feedbackID: 1 } });
      const latestFeedbackID = latestFeedback ? latestFeedback.feedbackID : 0;
      const newFeedbackID = latestFeedbackID + 1;
  
      const newFeedback = {
        feedbackID: newFeedbackID,
        feedbackUser: userID,
        feedbackDate: feedbackDate,
        feedbackDescription: feedbackDescription,
        feedbackResponse: "",
      };
  
      await feedbackCollection.insertOne(newFeedback);
  
      await venueCollection.updateOne(
        { venueName: venueName },
        { $push: { venueFeedback: newFeedbackID } }
      );
  
      res.json({ success: true, message: 'Successfully submitted feedback' });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ success: false, message: 'Failed to submit feedback' });
    }
  }

  async submitJournal(client, res, userID, journalDate, journalBeer, journalNotes, journalRating) {
    try {
      const db = client.db('FreshBearNearMe');
      const journalCollection = db.collection('Journal');
      const beerCollection = db.collection('Beer');
  
      const latestJournal = await journalCollection.findOne({}, { sort: { journalID: -1 } });
      const journalID = latestJournal ? latestJournal.journalID + 1 : 1;
      const beer = await beerCollection.findOne({ beerName: journalBeer });
      if (!beer) {
        return res.json({ success: false, message: 'Beer not found' });
      }
      const journalImage = beer.beerImage;
      const newJournal = {
        journalID,
        journalUser: userID,
        journalDate,
        journalBeer,
        journalNotes,
        journalRating,
        journalImage,
      };
  
      await journalCollection.insertOne(newJournal);
      const userCollection = db.collection('User');
      await userCollection.updateOne(
        { userID: userID },
        { $push: { journalArray: journalID } }
      );
  
      res.json({ success: true, message: 'Successfully submitted feedback', journal: newJournal });
    } catch (error) {
      console.error('Error submitting journal:', error);
      res.json({ success: false, message: 'Internal server error' });
    }
  }
  
  async getJournal(client, res, userID) {
    try {
      const db = client.db('FreshBearNearMe');
      const userCollection = db.collection('User');
      const journalCollection = db.collection('Journal');
  
      const user = await userCollection.findOne({ userID: parseInt(userID) });
  
      if (!user) {
        return res.json({ success: false, message: 'User not found' });
      }
      const journalIDs = user.journalArray || [];
      const journals = await journalCollection.find({ journalID: { $in: journalIDs } }).toArray();
  
      res.send(journals);
    } catch (error) {
      console.error('Error getting journals:', error);
      res.json({ success: false, message: 'Internal server error' });
    }
  }

  async editJournal(client, res, journalID, journalNotes, journalRating) {
    try {
      const db = client.db('FreshBearNearMe');
      const journalCollection = db.collection('Journal');
  
      const updatedJournal = await journalCollection.findOneAndUpdate(
        { journalID: journalID },
        { $set: { journalNotes: journalNotes, journalRating: journalRating } },
        { returnOriginal: false }
      );
  
      if (!updatedJournal.value) {
        return res.json({ success: false, message: 'Journal not found' });
      }
  
      res.json({ success: true, message: 'Journal updated successfully', updatedJournal: updatedJournal.value });
    } catch (error) {
      console.error('Error updating journal:', error);
      res.json({ success: false, message: 'Internal server error' });
    }
  }

  async getStatistics(client, res, userID) {
    try {
      const db = client.db('FreshBearNearMe');
      const userCollection = db.collection('User');
      const reviewCollection = db.collection('Reviews');
      const journalCollection = db.collection('Journal');
  
      const userData = await userCollection.findOne({ userID: parseInt(userID) });
  
      if (!userData) {
        return res.json({ success: false, message: 'User not found' });
      }
  
      const reviews = await reviewCollection.find({ reviewUser: parseInt(userID) }).toArray();
  
      const uniqueBeers = new Set();
      const uniqueVenues = new Set();
      const venueCountMap = new Map();
      let maxFrequency = 0;
      let favoriteTastingNote = null;
      let mostFrequentVenueID = null;
      let mostRecentBeerID = null;
      let mostRecentVenueID = null;
      let mostRecentBeerDate = null;
      let mostRecentVenueDate = null;
  
      reviews.forEach((review) => {
        const { reviewType, reviewItem, reviewDate } = review;
        if (reviewType === 'Beer') {
          uniqueBeers.add(reviewItem);
          if (reviewDate) {
            const reviewDateObject = new Date(reviewDate);
            if (!mostRecentBeerDate || reviewDateObject > mostRecentBeerDate) {
              mostRecentBeerDate = reviewDateObject;
              mostRecentBeerID = reviewItem;
            }
          }
        } else if (reviewType === 'Venue') {
          uniqueVenues.add(reviewItem);
          if (reviewDate) {
            const reviewDateObject = new Date(reviewDate);
            if (!mostRecentVenueDate || reviewDateObject > mostRecentVenueDate) {
              mostRecentVenueDate = reviewDateObject;
              mostRecentVenueID = reviewItem;
            }
          }
  
          const count = venueCountMap.get(reviewItem) || 0;
          const newCount = count + 1;
          venueCountMap.set(reviewItem, newCount);
  
          if (newCount > maxFrequency) {
            maxFrequency = newCount;
            mostFrequentVenueID = reviewItem;
          }
        }
      });
  
      const numUniqueBeers = uniqueBeers.size;
      const numUniqueVenues = uniqueVenues.size;
  
      const journalIDs = userData.journalArray || [];
      const journals = await journalCollection.find({ journalID: { $in: journalIDs } }).toArray();
  
      const allJournalNotes = journals.map((journal) => journal.journalNotes);

      const frequencyCount = allJournalNotes.reduce((countMap, note) => {
        countMap[note] = (countMap[note] || 0) + 1;
        return countMap;
      }, {});

      [favoriteTastingNote, maxFrequency] = Object.entries(frequencyCount).reduce(
        ([favNote, maxFreq], [note, freq]) => {
          if (freq > maxFreq) {
            return [note, freq];
          } else {
            return [favNote, maxFreq];
          }
        },
        [null, 0]
      );
  
      let favoriteVenueName = null;
      let numberOfTimes = 0;
      if (mostFrequentVenueID) {
        const venueCollection = db.collection('Venue');
        const venue = await venueCollection.findOne({ venueID: mostFrequentVenueID });
        favoriteVenueName = venue ? venue.venueName : null;
        numberOfTimes = venueCountMap.get(mostFrequentVenueID) || 0;
      }
  
      let mostRecentBeer = null;
      if (mostRecentBeerID) {
        const beerCollection = db.collection('Beer');
        mostRecentBeer = await beerCollection.findOne({ beerID: mostRecentBeerID });
      }

      let mostRecentVenue = null;
      if (mostRecentVenueID) {
        const venueCollection = db.collection('Venue');
        mostRecentVenue = await venueCollection.findOne({ venueID: mostRecentVenueID });
      }

      const statisticsObject = {
        favoriteTastingNote,
        numUniqueBeers,
        numUniqueVenues,
        favoriteVenueName,
        numberOfTimes,
        mostRecentBeer,
        mostRecentVenue,
      };
      res.send(statisticsObject);
    } catch (error) {
      console.error('Error getting user data:', error);
      res.json({ success: false, message: 'Internal server error' });
    }
  }

  async getPersonalisedRecommendation(client, res, userID) {
    try {
      const db = client.db('FreshBearNearMe'); 
      const reviewsCollection = db.collection('Reviews');
      const beerCollection = db.collection('Beer');
  
      const beerReviews = await reviewsCollection.find({
        reviewUser: parseInt(userID),
        reviewType: 'Beer'
      }).toArray();
  
      const categoryCount = {};
      for (const review of beerReviews) {
        const beerID = review.reviewItem;
        const beer = await beerCollection.findOne({ beerID: beerID });
        if (beer) {
          const beerCategory = beer.beerCategory;
          if (!categoryCount[beerCategory]) {
            categoryCount[beerCategory] = 1;
          } else {
            categoryCount[beerCategory]++;
          }
        }
      }
  
      let highestCount = 0;
      let mostFrequentCategory;
      for (const category in categoryCount) {
        if (categoryCount[category] > highestCount) {
          highestCount = categoryCount[category];
          mostFrequentCategory = category;
        }
      }

      const randomBeers = await beerCollection.aggregate([
        { $match: { beerCategory: mostFrequentCategory } },
        { $sample: { size: 3 } }
      ]).toArray();
  
      const recommendations = {
        mostFrequentCategory: mostFrequentCategory,
        recommendedBeers: randomBeers
      };
  
      res.send(recommendations);
  
    } catch (error) {
      console.error('Error getting personalized recommendation:', error);
      res.status(500).json({ error: 'Error getting personalized recommendation' });
    }
  }

  async getUpcomingEvents(client, res) {
    try {
        const db = client.db('FreshBearNearMe');
        const eventCollection = db.collection('Event');

        const currentDate = new Date(); // Current date as a JavaScript Date object
        const upcomingEvents = await eventCollection
            .find()
            .sort({ eventDate: 1 }) // Sort all events in ascending order of eventDate
            .toArray();

        const filteredUpcomingEvents = upcomingEvents.filter(event => {
            const eventDateParts = event.eventDate.split('/'); // Split the date string into parts
            const eventYear = parseInt(eventDateParts[2]);
            const eventMonth = parseInt(eventDateParts[0]) - 1; // Months are zero-based in JavaScript Date
            const eventDay = parseInt(eventDateParts[1]);
            
            const eventDate = new Date(eventYear, eventMonth, eventDay);
            return eventDate >= currentDate; // Compare the event date with the current date
        }).slice(0, 3); // Take the first 3 upcoming events

        res.status(200).json(filteredUpcomingEvents);
    } catch (error) {
        console.error("Error fetching upcoming events:", error);
        res.status(500).json({ error: "An error occurred while fetching upcoming events." });
    }
  }

  logout() {
    console.log("User logged out");
  }
}

module.exports = User;