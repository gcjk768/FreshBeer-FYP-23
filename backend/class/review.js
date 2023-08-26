class Review {
    constructor(client, reviewID, reviewUser, reviewDate, reviewDescription, reviewRating) {
        this.client = client;
        this.reviewID = reviewID;
        this.reviewUser = reviewUser;
        this.reviewDate = reviewDate;
        this.reviewDescription = reviewDescription;
        this.reviewRating = reviewRating;
    }

    static async addVenueReview(client, reviewText, rating, userID, reviewDate, venueID, res) {
        try {
          const db = client.db('FreshBearNearMe');
          const reviewsCollection = db.collection('Reviews');
          const venuesCollection = db.collection('Venue');
      
          const latestReview = await reviewsCollection.findOne({}, { sort: { reviewID: -1 } });
          const nextReviewID = latestReview ? latestReview.reviewID + 1 : 1;
      
          const newReview = {
            reviewID: nextReviewID,
            reviewUser: userID,
            reviewDate: reviewDate,
            reviewDescription: reviewText,
            reviewRating: rating,
            reviewItem: venueID,
            reviewType: "Venue"
          };
      
          // Add the review to the Reviews collection
          const result = await reviewsCollection.insertOne(newReview);
      
          // Update the venue with the new review
          const updateResult = await venuesCollection.updateOne(
            { venueID: venueID },
            { $push: { venueReview: nextReviewID } }
          );
      
          if (updateResult.modifiedCount === 1) {
            res.status(200).json({ success: true, message: 'Review added!' });
          } else {
            res.status(500).json({ success: false, message: 'Failed to add review to venue' });
          }
        } catch (error) {
          console.error('Error adding review:', error);
          res.status(500).json({ success: false, message: 'Failed to add review' });
        }
    }

    static async addBeerReview(client, reviewText, rating, userID, reviewDate, beerID, res) {
      try {
        const db = client.db('FreshBearNearMe');
        const reviewsCollection = db.collection('Reviews');
        const beerCollection = db.collection('Beer');
    
        const latestReview = await reviewsCollection.findOne({}, { sort: { reviewID: -1 } });
        const nextReviewID = latestReview ? latestReview.reviewID + 1 : 1;
    
        const newReview = {
          reviewID: nextReviewID,
          reviewUser: userID,
          reviewDate: reviewDate,
          reviewDescription: reviewText,
          reviewRating: rating,
          reviewItem: beerID,
          reviewType: "Beer"
        };
    
        // Add the review to the Reviews collection
        const result = await reviewsCollection.insertOne(newReview);
    
        // Update the beer with the new review
        const updateResult = await beerCollection.updateOne(
          { beerID: beerID },
          { $push: { communityReview: nextReviewID } }
        );
    
        if (updateResult.modifiedCount === 1) {
          res.status(200).json({ success: true, message: 'Review added!' });
        } else {
          res.status(500).json({ success: false, message: 'Failed to add review to venue' });
        }
      } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ success: false, message: 'Failed to add review' });
      }
    }

}

module.exports = Review;