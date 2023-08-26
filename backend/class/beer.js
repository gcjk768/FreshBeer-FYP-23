class Beer {
    constructor(client, beerID, beerName, beerLocation, beerDescription, beerImage, beerCategory, communityReview, abv, ibu, price, rating) {
        this.client = client;
        this.beerID = beerID;
        this.beerName = beerName;
        this.beerLocation = beerLocation;
        this.beerDescription = beerDescription;
        this.beerImage = beerImage;
        this.beerCategory = beerCategory;
        this.communityReview = communityReview;
        this.abv = abv;
        this.ibu = ibu;
        this.price = price;
        this.rating = rating;
    }

    static async getBeerData(client, beerArray, res) {
        try {
            const db = client.db('FreshBearNearMe');
            const beerData = await db.collection('Beer').find().toArray();

            const beers = beerData.map((data) => {
                const beer = new Beer(
                    client,
                    data.beerID,
                    data.beerName,
                    data.beerLocation,
                    data.beerDescription,
                    data.beerImage,
                    data.beerCategory,
                    data.communityReview,
                    data.abv,
                    data.ibu,
                    data.price,
                    data.rating
                );

                beerArray.push(beer);
                return beer;
            });

            res.json({ success: true, beerData});
            } catch (error) {
                console.error("Error retrieving beer data:", error);
                res.status(500).json({ success: false, message: "An error occurred while retrieving beer data"});
            }       
    }

    static async getBeerLocation(client, beerID, beerArray, res) {
        try {
            const matchingBeer = beerArray.find(beer => beer.beerID === beerID);
            if (matchingBeer) {
                const venueID = matchingBeer.beerLocation;
                const collection = client.db('FreshBearNearMe').collection('Venue');
                const venues = await collection.find({ venueID: {$in: venueID } }).toArray();
                res.json({ success: true, venues });
            } else {
                res.status(404).json({ success: false, message: 'Venue not found'});
            }
        } catch (error) {
            console.error("Error retrieving beer menu:", error);
            res.status(500).json({ success: false, message: "An error occurred while retrieving beer menu" });
        }
    }

    static async getBeerReview(client, beerID, beerArray, res) {
        try {
          const matchingVenue = beerArray.find(beer => beer.beerID === beerID);
          if (matchingVenue) {
            const reviewID = matchingVenue.communityReview;
            const collection = client.db('FreshBearNearMe').collection('Reviews');
            const review = await collection.find({ reviewID: { $in: reviewID } }).toArray();
            const userCollection = client.db('FreshBearNearMe').collection('User');
            const userID = review.map(review => review.reviewUser);
            const users = await userCollection.find({ userID: { $in: userID} }).toArray();
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
            res.status(404).json({ success: false, message: 'Beer not found' });
          }
        } catch (error) {
          console.error("Error retrieving beer reviews:", error);
          res.status(500).json({ success: false, message: "An error occurred while retrieving beer menu" });
        }
      }
    
}

module.exports = Beer;
