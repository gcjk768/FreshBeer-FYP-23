class Venue {
    constructor(client, venueID, venueName, venueAddress, venueContact, venueRating, venueImage, venueOperatingHours, venueMenu, venueReview, venueFreshness, venueLatitude, venueLongitude, venueTemperature, venueFeedback) {
        this.client = client;
        this.venueID = venueID;
        this.venueName = venueName;
        this.venueAddress = venueAddress;
        this.venueContact = venueContact;
        this.venueRating = venueRating;
        this.venueImage = venueImage;
        this.venueOperatingHours = venueOperatingHours;
        this.venueMenu = venueMenu;
        this.venueReview = venueReview;
        this.venueFreshness = venueFreshness;
        this.venueLatitude = venueLatitude;
        this.venueLongitude = venueLongitude;
        this.venueTemperature = venueTemperature;
        this.venueFeedback = venueFeedback;
    }

    static async getVenueData(client, venueArray, res) {
        try {
            const db = client.db('FreshBearNearMe');
            const venueData = await db.collection('Venue').find().toArray();
        
            const venues = venueData.map((data) => {
                const venue = new Venue(
                client,
                data.venueID,
                data.venueName,
                data.venueAddress,
                data.venueContact,
                data.venueRating,
                data.venueImage,
                data.venueOperatingHours,
                data.venueMenu,
                data.venueReview,
                data.venueFreshness,
                data.venueLatitude,
                data.venueLongitude,
                data.venueTemperature,
                data.venueFeedback,
                );
                venueArray.push(venue);
                return venue;
            });
        
            res.json({ success: true, venueData });
            } catch (error) {
            console.error("Error retrieving venue data:", error);
            res.status(500).json({ success: false, message: "An error occurred while retrieving venue data" });
        }
    }

    static async getVenueMenu(client, venueID, venueArray, res) {
      try {
        const matchingVenue = venueArray.find(venue => venue.venueID === venueID);
        if (matchingVenue) {
          const beerID = matchingVenue.venueMenu;
          const collection = client.db('FreshBearNearMe').collection('Beer');
          const beers = await collection.find({ beerID: { $in: beerID } }).toArray();
          res.json({ success: true, beers });
        } else {
          const parsedVenueID = parseInt(venueID);
          if (!isNaN(parsedVenueID)) {
            const matchingVenueInt = venueArray.find(venue => venue.venueID === parsedVenueID);
            if (matchingVenueInt) {
              const beerIDInt = matchingVenueInt.venueMenu;
              const collectionInt = client.db('FreshBearNearMe').collection('Beer');
              const beersInt = await collectionInt.find({ beerID: { $in: beerIDInt } }).toArray();
              res.json({ success: true, beers: beersInt });
            } else {
              res.status(404).json({ success: false, message: 'Venue not found' });
            }
          } else {
            res.status(404).json({ success: false, message: 'Venue not found' });
          }
        }
      } catch (error) {
        console.error("Error retrieving beer menu:", error);
        res.status(500).json({ success: false, message: "An error occurred while retrieving beer menu" });
      }
    }
    
    static async getVenueReview(client, venueID, venueArray, res) {
      try {
        const matchingVenue = venueArray.find(venue => venue.venueID === venueID);
        if (matchingVenue) {
          const reviewID = matchingVenue.venueReview;
          const collection = client.db('FreshBearNearMe').collection('Reviews');
          const review = await collection.find({ reviewID: { $in: reviewID } }).toArray();
    
          const userCollection = client.db('FreshBearNearMe').collection('User');
          const userID = review.map(review => review.reviewUser);
          const users = await userCollection.find({ userID: { $in: userID } }).toArray();
          const userMap = users.reduce((map, user) => {
            map[user.userID] = user.username;
            return map;
          }, {});
    
          const updatedReviews = review.map(review => {
            const username = userMap[review.reviewUser];
            return { ...review, reviewUser: username };
          });
    
          res.json({ success: true, review: updatedReviews });
        } else {
          const parsedVenueID = parseInt(venueID);
          if (!isNaN(parsedVenueID)) {
            const matchingVenueInt = venueArray.find(venue => venue.venueID === parsedVenueID);
            if (matchingVenueInt) {
              const reviewIDInt = matchingVenueInt.venueReview;
              const collectionInt = client.db('FreshBearNearMe').collection('Reviews');
              const reviewInt = await collectionInt.find({ reviewID: { $in: reviewIDInt } }).toArray();
    
              const userCollectionInt = client.db('FreshBearNearMe').collection('User');
              const userIDInt = reviewInt.map(review => review.reviewUser);
              const usersInt = await userCollectionInt.find({ userID: { $in: userIDInt } }).toArray();
              const userMapInt = usersInt.reduce((map, user) => {
                map[user.userID] = user.username;
                return map;
              }, {});
    
              const updatedReviewsInt = reviewInt.map(review => {
                const username = userMapInt[review.reviewUser];
                return { ...review, reviewUser: username };
              });
    
              res.json({ success: true, review: updatedReviewsInt });
            } else {
              res.status(404).json({ success: false, message: 'Venue not found' });
            }
          } else {
            res.status(404).json({ success: false, message: 'Venue not found' });
          }
        }
      } catch (error) {
        console.error("Error retrieving venue reviews:", error);
        res.status(500).json({ success: false, message: "An error occurred while retrieving beer menu" });
      }
    }

    static async getVenueCoordinates(client, venueArray, res) {
      try {
        const uniqueVenues = [];
        const venueIDs = new Set();
    
        for (const venue of venueArray) {
          if (!venueIDs.has(venue.venueID)) {
            uniqueVenues.push(venue);
            venueIDs.add(venue.venueID);
          }
        }
        const simplifiedData = uniqueVenues.map((venue) => {
          return {
            venueID: venue.venueID,
            venueName: venue.venueName,
            venueAddress: venue.venueAddress,
            venueRating: venue.venueRating,
            venueImage: venue.venueImage,
            venueOperatingHours: venue.venueOperatingHours,
            venueLatitude: venue.venueLatitude,
            venueLongitude: venue.venueLongitude,
          };
        });
        res.json({ success: true, venues: simplifiedData });
      } catch (error) {
        console.error("Error retrieving venue coordinates:", error);
        res
          .status(500)
          .json({
            success: false,
            message: "An error occurred while retrieving venue coordinates",
          });
      }
    }
}

module.exports = Venue;