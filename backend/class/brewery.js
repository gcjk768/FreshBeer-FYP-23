class Brewery {
	constructor(
		client,
		breweryID,
		breweryName,
		breweryAddress,
		breweryContact,
		breweryRating,
		breweryImage,
		breweryOperatingHours,
		breweryMenu,
		breweryReview,
		breweryFreshness,
		breweryLatitude,
		breweryLongitude,
		breweryTemperature
	) {
		this.client = client;
		this.breweryID = breweryID;
		this.breweryName = breweryName;
		this.breweryAddress = breweryAddress;
		this.breweryContact = breweryContact;
		this.breweryRating = breweryRating;
		this.breweryImage = breweryImage;
		this.breweryOperatingHours = breweryOperatingHours;
		this.breweryMenu = breweryMenu;
		this.breweryReview = breweryReview;
		this.breweryFreshness = breweryFreshness;
		this.breweryLatitude = breweryLatitude;
		this.breweryLongitude = breweryLongitude;
		this.breweryTemperature = breweryTemperature;
	}

	static async getBreweryData(client, breweryArray, res) {
		try {
			const db = client.db("FreshBearNearMe");
			const breweryData = await db.collection("Brewery").find().toArray();

			const breweries = breweryData.map((data) => {
				const brewery = new Brewery(
					client,
					data.breweryID,
					data.breweryName,
					data.breweryAddress,
					data.breweryContact,
					data.breweryRating,
					data.breweryImage,
					data.breweryOperatingHours,
					data.breweryMenu,
					data.breweryReview,
					data.breweryFreshness,
					data.breweryLatitude,
					data.breweryLongitude,
					data.breweryTemperature
				);
				breweryArray.push(brewery);
				return brewery;
			});

			res.json({ success: true, breweryData });
		} catch (error) {
			console.error("Error retrieving brewery data:", error);
			res.status(500).json({
				success: false,
				message: "An error occurred while retrieving brewery data",
			});
		}
	}

	static async getBreweryCoordinates(client, res) {
		try {

		} catch { 
			
		}
	}
}

module.exports = Brewery;
