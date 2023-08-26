class VenueOwner {
	constructor(
		client,
		venueOwnerID,
		username,
		password,
		email,
		mobileNumber,
		venueID
	) {
		this.client = client;
		this.venueOwnerID = venueOwnerID;
		this.username = username;
		this.password = password;
		this.email = email;
		this.mobileNumber = mobileNumber;
		this.venueID = venueID;
	}

	async login(res, username, password) {
		try {
			const db = this.client.db("FreshBearNearMe");
			const collection = db.collection("VenueOwners");

			//Find a data that matc hes the username and password
			const result = await collection.findOne({ username, password });

			if (result) {
				this.venueOwnerID = result.venueOwnerID;
				this.email = result.email;
				this.mobileNumber = result.mobileNumber;
				this.venueID = result.venueID;
				//Create a session token
				const sessionToken = "testtoken123";

				//Set the session token in a cookie
				res.cookie("sessionToken", sessionToken, { httpOnly: true });

				//Set the username in a separate cookie
				res.cookie("username", result.username, { httpOnly: true });

				//Set object id in a separate cookie
				res.cookie("venueOwnerID", result.venueOwnerID, { httpOnly: true });

				res.json({
					success: true,
					venueOwnerID: result.venueOwnerID,
					username: result.username,
				});
			} else {
				res.json({ success: false, message: "Invalid username or password" });
			}
		} catch (error) {
			console.error("Error during login:", error);
			res
				.status(500)
				.json({ success: false, message: "An error occurred during login" });
		}
	}

	async getFeedback(client, res, venueOwnerID) {
		try {
			const db = client.db("FreshBearNearMe");
			const venueOwnersCollection = db.collection("VenueOwners");
			const venueCollection = db.collection("Venue");
			const feedbackCollection = db.collection("Feedback");
			const userCollection = db.collection("User");

			const venueOwnerDocument = await venueOwnersCollection.findOne({
				venueOwnerID: parseInt(venueOwnerID),
			});

			if (!venueOwnerDocument) {
				return res
					.status(404)
					.json({ success: false, message: "Venue owner not found" });
			}

			const ownedVenueIDs = venueOwnerDocument.venueID || [];
			if (ownedVenueIDs.length === 0) {
				return res.json({
					success: true,
					message: "No venues found for the venue owner",
				});
			}

			const feedbacks = [];
			for (const venueID of ownedVenueIDs) {
				const venueDocument = await venueCollection.findOne({
					venueID: venueID,
				});
				if (venueDocument && venueDocument.venueFeedback) {
					const feedbackIDs = venueDocument.venueFeedback;
					for (const feedbackID of feedbackIDs) {
						const feedbackDocument = await feedbackCollection.findOne({
							feedbackID: feedbackID,
						});
						if (feedbackDocument) {
							const feedbackUserID = feedbackDocument.feedbackUser;
							const userDocument = await userCollection.findOne({
								userID: feedbackUserID,
							});
							if (userDocument) {
								feedbacks.push({
									venueID: venueDocument.venueID,
									venueName: venueDocument.venueName,
									feedback: {
										...feedbackDocument,
										username: userDocument.username,
									},
								});
							}
						}
					}
				}
			}

			return res.json({ success: true, feedbacks });
		} catch (error) {
			console.error("Error fetching feedback:", error);
			return res
				.status(500)
				.json({ success: false, message: "Internal server error" });
		}
	}

	async replyFeedback(client, res, feedbackID, feedbackResponse) {
		try {
			const db = client.db("FreshBearNearMe");
			const feedbackCollection = db.collection("Feedback");

			const feedbackToUpdate = await feedbackCollection.findOne({
				feedbackID: feedbackID,
			});

			if (!feedbackToUpdate) {
				return res.json({ success: false, message: "Feedback not found." });
			}

			if (feedbackToUpdate.feedbackResponseBool) {
				return res.json({
					success: false,
					message: "Feedback has already been responded!",
				});
			}

			await feedbackCollection.updateOne(
				{ feedbackID: feedbackID },
				{
					$set: {
						feedbackResponse: feedbackResponse,
						feedbackResponseBool: true,
					},
				}
			);
			res.json({
				success: true,
				message: "Feedback response updated successfully.",
			});
		} catch (error) {
			console.error("Error updating feedback:", error);
			res.json({
				success: false,
				error: "An error occurred while updating the feedback.",
			});
		}
	}

	async getVenueProfile(client, res, venueOwnerID) {
		try {
			const db = client.db("FreshBearNearMe");

			const venueOwnersCollection = db.collection("VenueOwners");
			const venueOwner = await venueOwnersCollection.findOne({
				venueOwnerID: parseInt(venueOwnerID),
			});

			if (!venueOwner) {
				return res.json({ success: false, message: "Venue owner not found." });
			}

			const venuesCollection = db.collection("Venue");
			const venueIDs = venueOwner.venueID;

			const venues = await venuesCollection
				.find({
					venueID: { $in: venueIDs },
				})
				.toArray();

			res.send(venues);
		} catch (error) {
			console.error("Error getting venue profile:", error);
			res.json({
				success: false,
				error: "An error occurred while retrieving venue profile.",
			});
		}
	}

	async updateVenue(
		client,
		res,
		venueID,
		venueName,
		venueContact,
		venueAddress,
		venueOperatingHours
	) {
		try {
			const venueCollection = client.db("FreshBearNearMe").collection("Venue");
			const updateResult = await venueCollection.updateOne(
				{ venueID: venueID },
				{
					$set: {
						venueName: venueName,
						venueContact: venueContact,
						venueAddress: venueAddress,
						venueOperatingHours: venueOperatingHours,
					},
				}
			);

			if (updateResult.modifiedCount === 1) {
				res.json({ success: true });
			} else {
				res.json({ success: false, message: "Venue not found" });
			}
		} catch (error) {
			console.error("Error updating venue:", error);
			res
				.status(500)
				.json({ success: false, message: "Internal server error" });
		}
	}

	async getVOVenueMenu(client, res, venueMenu) {
		try {
			const db = client.db("FreshBearNearMe");
			const beersCollection = db.collection("Beer");
			const beerIDs = venueMenu.map(Number);
			const venueMenuData = await beersCollection
				.find({ beerID: { $in: beerIDs } })
				.toArray();

			res.send(venueMenuData);
		} catch (error) {
			console.error("Error retrieving venue menu:", error);
			res.status(500).json({ error: "Failed to retrieve venue menu" });
		}
	}

	async editVenueMenu(client, res, beerID, beerName, abv, ibu, price) {
		try {
			const db = client.db("FreshBearNearMe");
			const beerCollection = db.collection("Beer");

			const parsedAbv = parseFloat(abv);
			const parsedIbu = parseInt(ibu);
			const parsedPrice = parseInt(price);

			const updateResult = await beerCollection.updateOne(
				{ beerID: parseInt(beerID) },
				{
					$set: {
						beerName: beerName,
						abv: parsedAbv,
						ibu: parsedIbu,
						price: parsedPrice,
					},
				}
			);

			if (updateResult.matchedCount === 0) {
				res.json({ success: false, message: "Beer not found" });
			} else {
				res.json({ success: true });
			}
		} catch (error) {
			console.error("Error editing beer:", error);
			res.json({ success: false, message: "Internal server error" });
		}
	}

	async addVenueMenu(
		client,
		res,
		beerName,
		beerLocation,
		beerDescription,
		beerImage,
		beerCategory,
		abv,
		ibu,
		price
	) {
		try {
			const db = client.db("FreshBearNearMe");
			const beerCollection = db.collection("Beer");
			const venueCollection = db.collection("Venue");

			const latestBeer = await beerCollection.findOne(
				{},
				{ sort: { beerID: -1 } }
			);
			let newBeerID = 1;
			if (latestBeer) {
				newBeerID = latestBeer.beerID + 1;
			}

			const newBeer = {
				beerID: newBeerID,
				beerName: beerName,
				beerLocation: Array.isArray(beerLocation)
					? beerLocation
					: [beerLocation],
				beerDescription: beerDescription,
				beerImage: beerImage,
				beerCategory: beerCategory,
				communityReview: [],
				abv: parseFloat(abv),
				ibu: parseInt(ibu),
				price: parseInt(price),
				rating: 0,
			};

			const result = await beerCollection.insertOne(newBeer);
			const venue = await venueCollection.findOne({ venueID: beerLocation });
			if (venue) {
				await venueCollection.updateOne(
					{ venueID: beerLocation },
					{ $push: { venueMenu: newBeerID } }
				);
				res.json({ success: true });
			} else {
				res.json({
					success: false,
					message: "Failed to add new beer to collection.",
				});
			}
		} catch (error) {
			console.error(error);
			res.json({
				success: false,
				message: "An error occurred while adding new beer.",
			});
		}
	}

	async addEvent(
		client,
		res,
		eventTitle,
		eventDate,
		eventDescription,
		eventCreator
	) {
		try {
			const eventsCollection = client.db("FreshBearNearMe").collection("Event");

			const latestEvent = await eventsCollection.findOne(
				{},
				{ sort: { eventID: -1 } }
			);
			const latestEventID = latestEvent ? latestEvent.eventID : 0;
			const newEventID = latestEventID + 1;

			const newEvent = {
				eventID: newEventID,
				eventTitle,
				eventDate,
				eventDescription,
				eventCreator,
			};
			const result = await eventsCollection.insertOne(newEvent);

			if (result) {
				res.json({
					success: true,
					message: "Event added successfully.",
					event: newEvent,
				});
			} else {
				console.log("Failed to add the event.");
				res.json({ success: false, message: "Failed to add the event." });
			}
		} catch (error) {
			console.error("Error adding event:", error);
			res.json({
				success: false,
				message: "An error occurred while adding the event.",
			});
		}
	}

	async getEvent(client, res, venueOwnerID) {
		try {
			const db = client.db("FreshBearNearMe");
			const eventsCollection = db.collection("Event");

			const events = await eventsCollection
				.find({ eventCreator: parseInt(venueOwnerID) })
				.toArray();
			res.send(events);
		} catch (error) {
			console.error("Error retrieving events:", error);
			res
				.status(500)
				.json({ error: "An error occurred while retrieving events." });
		}
	}

	async removeEvent(client, res, eventID) {
		try {
			const db = client.db("FreshBearNearMe");
			const eventsCollection = db.collection("Event");

			const result = await eventsCollection.deleteOne({ eventID: eventID });

			if (result.deletedCount === 1) {
				res.json({ success: true, message: "Event removed successfully" });
			} else {
				console.log(`No event found with eventID: ${eventID}`);
				res.json({ success: false, message: "Event not found" });
			}
		} catch (error) {
			console.error("Error removing event:", error);
			res.json({ success: false, message: "Internal server error" });
		}
	}

	// get most popular beer
	async getMostPopularBeer(client, res, venueOwnerID) {
		try {
			const db = client.db("FreshBearNearMe");
			const reviewsCollection = db.collection("Reviews");
			const beerCollection = db.collection("Beer");

			const beerReviews = await reviewsCollection
				.find({ reviewType: "Beer" })
				.toArray();

			const beerPopularityCount = {};
			for (const review of beerReviews) {
				const beerID = review.reviewItem;
				const beer = await beerCollection.findOne({ beerID: beerID });
				if (beer) {
					if (!beerPopularityCount[beerID]) {
						beerPopularityCount[beerID] = 1;
					} else {
						beerPopularityCount[beerID]++;
					}
				}
			}

			// find the beer with the highest number of positive reviews
			const beerPopularity = {};
			for (const beerID in beerPopularityCount) {
				beerPopularity[beerID] = beerPopularityCount[beerID];
			}

			// sort beers by popularity
			const sortedBeers = Object.keys(beerPopularity).sort(
				(a, b) => beerPopularity[b] - beerPopularity[a]
			);

			// top 3 most popular beer IDs
			const top3MostPopularBeerIDs = sortedBeers.slice(0, 3);

			// top 3 most popular beers from the Beer collection
			const top3MostPopularBeers = await beerCollection
				.find({
					beerID: { $in: top3MostPopularBeerIDs.map((id) => parseInt(id)) },
				})
				.toArray();

			// most popular beer
			const mostPopularBeerID = sortedBeers[0];
			const mostPopularBeer = await beerCollection.findOne({
				beerID: parseInt(mostPopularBeerID),
			});

			res.json({ mostPopularBeer, top3MostPopularBeers });
		} catch (error) {
			console.error("Error getting most popular beer:", error);
			res.status(500).json({ error: "Error getting most popular beer" });
		}
	}

	// get most popular venue
	async getMostPopularVenue(client, res, venueOwnerID) {
		try {
			const db = client.db("FreshBearNearMe");
			const reviewsCollection = db.collection("Reviews");
			const venueCollection = db.collection("Venue");

			const venueReviews = await reviewsCollection
				.find({ reviewType: "Venue" })
				.toArray();

			const venuePopularityCount = {};
			for (const review of venueReviews) {
				const venueID = review.reviewItem;
				const venue = await venueCollection.findOne({ venueID: venueID });
				if (venue) {
					if (!venuePopularityCount[venueID]) {
						venuePopularityCount[venueID] = 1;
					} else {
						venuePopularityCount[venueID]++;
					}
				}
			}

			// find the venue with the highest number of positive reviews
			const venuePopularity = {};
			for (const venueID in venuePopularityCount) {
				venuePopularity[venueID] = venuePopularityCount[venueID];
			}

			// Sort venues by popularity
			const sortedVenues = Object.keys(venuePopularity).sort(
				(a, b) => venuePopularity[b] - venuePopularity[a]
			);

			// Top 3 most popular venue IDs
			const top3MostPopularVenueIDs = sortedVenues.slice(0, 3);

			// Top 3 most popular venues from the Venue collection
			const top3MostPopularVenues = await venueCollection
				.find({
					venueID: { $in: top3MostPopularVenueIDs.map((id) => parseInt(id)) },
				})
				.toArray();

			// Most popular venue
			const mostPopularVenueID = sortedVenues[0];
			const mostPopularVenue = await venueCollection.findOne({
				venueID: parseInt(mostPopularVenueID),
			});

			res.json({ mostPopularVenue, top3MostPopularVenues });
		} catch (error) {
			console.error("Error getting most popular venue:", error);
			res.status(500).json({ error: "Error getting most popular venue" });
		}
	}
}

module.exports = VenueOwner;
