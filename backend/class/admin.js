class Admin {
	constructor(client, adminID, username, password, email, mobileNumber) {
		this.client = client;
		this.adminID = adminID;
		this.username = username;
		this.password = password;
		this.email = email;
		this.mobileNumber = mobileNumber;
	}

	async login(res, username, password) {
		try {
			const db = this.client.db("FreshBearNearMe");
			const collection = db.collection("Admin");

			//Find a data that matc hes the username and password
			const result = await collection.findOne({ username, password });

			if (result) {
				this.adminID = result.adminID;
				this.email = result.email;
				this.mobileNumber = result.mobileNumber;
				//Create a session token
				const sessionToken = "testtoken123";

				//Set the session token in a cookie
				res.cookie("sessionToken", sessionToken, { httpOnly: true });

				//Set the username in a separate cookie
				res.cookie("username", result.username, { httpOnly: true });

				//Set object id in a separate cookie
				res.cookie("adminID", result.adminID, { httpOnly: true });

				res.json({
					success: true,
					adminID: result.adminID,
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

	async getBugs(client, res) {
		try {
			const db = client.db('FreshBearNearMe');
			const issuesCollection = db.collection('Issue');
	
			const issues = await issuesCollection.find({}).toArray();
	
			if (issues.length > 0) {
				res.send(issues);
			} else {
				res.status(500).json({ error: "Error getting bugs" });
			}
		} catch (error) {
			res.status(500).json({ error: "Error getting bugs" });
		}
	}

	async resolveBugs(client, res, issueID) {
		try {
			const db = client.db("FreshBearNearMe");
			const collection = db.collection("Issue");
	
			const query = { issueID: issueID };
			const update = { $set: { issueStatus: true } };
	
			const result = await collection.updateOne(query, update);
	
			if (result.modifiedCount > 0) {
				res.json({ success: true, message: "Bug resolved successfully." });
			} else {
				res.json({ success: false, message: "Bug not found or not updated." });
			}
		} catch (error) {
			console.error("Error resolving bug:", error);
			res.json({ success: false, message: "An error occurred while resolving the bug." });
		}
	}
	
	async getUser(client, res) {
		try {
			const db = client.db('FreshBearNearMe');
			const userCollection = db.collection('User');
			const venueOwnersCollection = db.collection('VenueOwners');
			const adminCollection = db.collection('Admin');
	
			const [users, venueOwners, admins] = await Promise.all([
				userCollection.find().toArray(),
				venueOwnersCollection.find().toArray(),
				adminCollection.find().toArray(),
			]);
	
			const allDocuments = {
				users,
				venueOwners,
				admins,
			};
	
			res.json(allDocuments);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: 'An error occurred while fetching documents.' });
		}
	}

	async createUser(client, res, username, password, email, mobileNumber, selectedAccountType) {

		function generateRandomString(length) {
			const characters =
				"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			let randomString = "";
			for (let i = 0; i < length; i++) {
				const randomIndex = Math.floor(Math.random() * characters.length);
				randomString += characters[randomIndex];
			}
			return randomString;
		}

		async function getNextUserID(db, collectionName, selectedAccountType) {	
			if (selectedAccountType === "User") {
				const result = await db.collection(collectionName).find().sort({ userID: -1 }).limit(1).toArray();
				if (result.length === 0) {
					return 1; 
				}
			return result[0].userID + 1;
			} else if (selectedAccountType === "Venue Owner") {
				const result = await db.collection(collectionName).find().sort({ venueOwnerID: -1 }).limit(1).toArray();
				if (result.length === 0) {
					return 1; 
				}
			return result[0].venueOwnerID + 1;
			} else if (selectedAccountType === "Admin") {
				const result = await db.collection(collectionName).find().sort({ adminID: -1 }).limit(1).toArray();
				if (result.length === 0) {
					return 1; 
				}
			return result[0].adminID + 1;			
			}
		}

		try {
			const db = client.db("FreshBearNearMe"); 
			
			const userData = {
				username,
				password,
				email,
				mobileNumber,
			};
			
			let collectionName = "";
			if (selectedAccountType === "User") {
				collectionName = "User";
				userData.userID = await getNextUserID(db, collectionName, selectedAccountType)
				userData.receiveNotificaion = false
				userData.followArray = []
				userData.recommendationArray = []
				userData.referralCode = generateRandomString(8)
				userData.referralPoints = 0
				userData.referralClaim = [] 
				userData.rewardArray = []
				userData.wishlistArray = []
				userData.journalArray = []
			} else if (selectedAccountType === "Venue Owner") {
				collectionName = "VenueOwners";
				userData.venueID = []
				userData.venueOwnerID = await getNextUserID(db, collectionName, selectedAccountType)
			} else if (selectedAccountType === "Admin") {
				collectionName = "Admin";
				userData.adminID = await getNextUserID(db, collectionName, selectedAccountType)
			} else {
				throw new Error("Invalid account type");
			}
			
			const result = await db.collection(collectionName).insertOne(userData);
			
			if (result.insertedId) {
				console.log("User created successfully");
				res.json({ success: true, message: "User created successfully" });
			} else {
				console.log("Failed to create user");
				res.json({ success: false, message: "Failed to create user" });
			}
		} catch (error) {
			console.error("Error creating user:", error);
			res.status(500).json({ success: false, message: "An error occurred while creating user" });
		}
	}

	async editUser(client, res, selectedUser) {
		try {
			const db = client.db("FreshBearNearMe");
			
			if (selectedUser.adminID) {
				const adminsCollection = db.collection("Admin");
				await adminsCollection.updateOne(
					{ adminID: selectedUser.adminID },
					{
						$set: {
							username: selectedUser.username,
							password: selectedUser.password,
							email: selectedUser.email,
							mobileNumber: selectedUser.mobileNumber
						},
					}
				);
			} else if (selectedUser.userID) {
				const usersCollection = db.collection("User");
				await usersCollection.updateOne(
					{ userID: selectedUser.userID },
					{
						$set: {
							username: selectedUser.username,
							password: selectedUser.password,
							email: selectedUser.email,
							mobileNumber: selectedUser.mobileNumber,
							referralCode: selectedUser.referralCode,
							referralPoints: selectedUser.referralPoints,
						},
					}
				);
			} else if (selectedUser.venueOwnerID) {
				const venueOwnersCollection = db.collection("VenueOwners");
				await venueOwnersCollection.updateOne(
					{ venueOwnerID: selectedUser.venueOwnerID },
					{
						$set: {
							username: selectedUser.username,
							password: selectedUser.password,
							email: selectedUser.email,
							mobileNumber: selectedUser.mobileNumber
						},
					}
				);
			}
			
			res.json({ success: true, message: "User edited successfully" });
		} catch (error) {
			console.error("Error editing user:", error);
			res.status(500).json({ success: false, message: "An error occurred while editing user" });
		}
	}

	async getBrewery(client, res) {
		try {
			const db = client.db('FreshBearNearMe');
			const breweryCollection = db.collection('Brewery');
	
			const brewery = await breweryCollection.find({}).toArray();
	
			if (brewery.length > 0) {
				res.send(brewery);
			} else {
				res.status(500).json({ error: "Error getting brewery data" });
			}
		} catch (error) {
			res.status(500).json({ error: "Error getting brewery data" });
		}
	}

	async editBrewery(client, res, selectedBrewery) {
		try {
			const db = client.db('FreshBearNearMe')
			const breweryCollection = db.collection('Brewery');

			await breweryCollection.updateOne(
				{ breweryID : selectedBrewery.breweryID},
				{
					$set: {
						breweryName : selectedBrewery.breweryName,
						breweryAddress : selectedBrewery.breweryAddress,
						breweryContact : selectedBrewery.breweryContact,
						breweryImage : selectedBrewery.breweryImage,
						breweryOperatingHours : selectedBrewery.breweryOperatingHours,
					},
				}
			)
			res.json({ success: true, message: "Brewery successfully editted"})
		} catch (error) {
			res.json({ success: false, message: "An error occurred while editting brewery" });
		}
	}

	async addBrewery(client, res, breweryName, breweryAddress, breweryContact, breweryImage, breweryOperatingHours, breweryLatitude, breweryLongitude) {
		try {
			const latestBrewery = await client.db("FreshBearNearMe").collection("Brewery").find().sort({ breweryID: -1 }).limit(1).toArray();
			const latestID = latestBrewery.length > 0 ? latestBrewery[0].breweryID : 0;
	
			const newBreweryID = latestID + 1;
			const newBrewery = {
				breweryID: newBreweryID,
				breweryName,
				breweryAddress,
				breweryContact,
				breweryRating : 0,
				breweryImage,
				breweryOperatingHours,
				breweryMenu : [],
				breweryReview: [],
				breweryLatitude,
				breweryLongitude,
				breweryFreshness: 0,
				breweryTemperature: 0,
			};
			await client.db("FreshBearNearMe").collection("Brewery").insertOne(newBrewery);
	
			res.json({ success: true, message: "Brewery added successfully." });
		} catch (error) {
			res.json({ success: false, message: "An error occurred while adding the brewery." });
		}
	}

	async getVenue(client, res) {
		try {
			const db = client.db('FreshBearNearMe');
			const venueCollection = db.collection('Venue');
	
			const venue = await venueCollection.find({}).toArray();
	
			if (venue.length > 0) {
				res.send(venue);
			} else {
				res.status(500).json({ error: "Error getting brewery data" });
			}
		} catch (error) {
			res.status(500).json({ error: "Error getting brewery data" });
		}
	}

	async editVenue(client, res, selectedVenue) {
		try {
			const db = client.db('FreshBearNearMe')
			const venueCollection = db.collection('Venue');

			await venueCollection.updateOne(
				{ venueID : selectedVenue.venueID},
				{
					$set: {
						venueName : selectedVenue.venueName,
						venueAddress : selectedVenue.venueAddress,
						venueContact : selectedVenue.venueContact,
						venueImage : selectedVenue.venueImage,
						venueOperatingHours : selectedVenue.venueOperatingHours,
					},
				}
			)
			res.json({ success: true, message: "Venue successfully editted"})
		} catch (error) {
			res.json({ success: false, message: "An error occurred while editting Venue" });
		}
	}

	async addVenue(client, res, venueName, venueAddress, venueContact, venueImage, venueOperatingHours, venueLatitude, venueLongitude) {
		try {
			const latestVenue = await client.db("FreshBearNearMe").collection("Venue").find().sort({ venueID: -1 }).limit(1).toArray();
			const latestID = latestVenue.length > 0 ? latestVenue[0].venueID : 0;
	
			const newVenueID = latestID + 1;
			const newVenue = {
				venueID: newVenueID,
				venueName,
				venueAddress,
				venueContact,
				venueRating : 0,
				venueImage,
				venueOperatingHours,
				venueMenu : [],
				venueReview: [],
				venueLatitude,
				venueLongitude,
				venueFreshness: 0,
				venueTemperature: 0,
				venueFeedback: [],
			};
			await client.db("FreshBearNearMe").collection("Venue").insertOne(newVenue);
	
			res.json({ success: true, message: "Venue added successfully." });
		} catch (error) {
			res.json({ success: false, message: "An error occurred while adding the venue." });
		}
	}
}

module.exports = Admin;
