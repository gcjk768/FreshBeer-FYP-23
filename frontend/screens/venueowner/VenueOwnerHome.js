import {
	Entypo,
	FontAwesome,
	FontAwesome5,
	Ionicons,
	MaterialIcons,
	Octicons,
} from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
	Image,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { Header } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCookies } from "../../CookieContext";
import COLORS from "../../constants/colors";
import GlobalStyle from "../../utils/GlobalStyle";

const Button = (props) => {
	const filledBgColor = props.color || COLORS.primary;
	const outlinedColor = COLORS.white;
	const bgColor = props.filled ? filledBgColor : outlinedColor;
	const textColor = COLORS.black;

	return (
		<TouchableOpacity
			style={{
				...styles.button,
				...{ backgroundColor: bgColor },
				...props.style,
			}}
			onPress={props.onPress}
		>
			<Text
				style={{
					fontSize: 12,
					...GlobalStyle.bodyFont,
					...{ color: textColor },
				}}
			>
				{props.title}
			</Text>
		</TouchableOpacity>
	);
};

const CustomText = (props) => {
	return (
		<Text style={{ ...GlobalStyle.bodyFont, ...props.style }}>
			{props.children}
		</Text>
	);
};

const VenueOwnerHome = ({ navigation }) => {
	const { cookies } = useCookies();
	const [username, setUsername] = useState("");

	const [feedbackData, setFeedbackData] = useState([]);
	const [newFeedbackData, setNewFeedbackData] = useState([]);
	const [loading, setLoading] = useState(true);

	const [popularData, setPopularData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [popularVenueData, setPopularVenueData] = useState([]);
	const [isLoading2, setIsLoading2] = useState(true);

	const [popupVisible, setPopupVisible] = useState(false);
	const [popupVisible2, setPopupVisible2] = useState(false);

	function parseDate(dateString) {
		const [day, month, year] = dateString.split("/");
		return new Date(`${year}-${month}-${day}`);
	}

	const handlePopup = () => {
		setPopupVisible(!popupVisible);
	};

	const handlePopUp2 = () => {
		setPopupVisible2(!popupVisible2);
	};

	useEffect(() => {
		setUsername(cookies.username);
		axios
			.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getFeedback", {
				params: {
					venueOwnerID: cookies.venueOwnerID,
				},
			})
			.then((response) => {
				const { feedbacks } = response.data;

				let latestFeedback = null;
				for (const feedback of feedbacks) {
					const feedbackDate = parseDate(feedback.feedback.feedbackDate);
					if (
						!latestFeedback ||
						feedbackDate > parseDate(latestFeedback.feedback.feedbackDate)
					) {
						latestFeedback = feedback;
					}
				}
				setNewFeedbackData(latestFeedback);
				setLoading(false);
			})
			.catch((error) => {
				console.error("Error retrieving data", error);
				setLoading(false);
			});
	}, []);

	// for most popular beer
	useEffect(() => {
		axios
			.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getMostPopularBeer", {
				params: {
					venueOwnerID: cookies.venueOwnerID,
				},
			})
			.then((response) => {
				setPopularData(response.data);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error("Error retrieving POPULAR BEER", error);
				setIsLoading(false);
			});
	}, []);

	// for most popular venue
	useEffect(() => {
		axios
			.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getMostPopularVenue", {
				params: {
					venueOwnerID: cookies.venueOwnerID,
				},
			})
			.then((response) => {
				setPopularVenueData(response.data);
				setIsLoading2(false);
			})
			.catch((error) => {
				console.error("Error retrieving POPULAR VENUE", error);
				setIsLoading2(false);
			});
	}, []);

	const navigateToRespond = () => {
		navigation.navigate("Respond", { feedbackData: newFeedbackData });
	};

	return (
		<View style={{ flex: 1 }}>
			<SafeAreaView style={{ flex: 1 }} backgroundColor={COLORS.secondary}>
				<Header
					placement="left"
					backgroundColor={COLORS.primary}
					containerStyle={{
						height: 100,
						borderBottomLeftRadius: 40,
						borderBottomRightRadius: 40,
					}}
					centerComponent={{
						text: "FreshBeer",
						style: {
							fontSize: 20,
							...GlobalStyle.headerFont,
							flexDirection: "row",
							justifyContent: "flex-start",
						},
					}}
					rightComponent={
						<View style={{ flexDirection: "row" }}>
							<TouchableOpacity onPress={() => navigation.navigate("Welcome")}>
								<MaterialIcons name="logout" size={24} color={COLORS.black} />
							</TouchableOpacity>
						</View>
					}
				/>

				<SafeAreaView style={{ flex: 1 }}>
					<ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
						<View
							style={{
								justifyContent: "center",
								alignItems: "center",
								marginTop: 5,
							}}
						>
							<Text
								style={{
									fontSize: 26,
									color: COLORS.black,
									marginTop: 20,
									marginBottom: 12,
									...GlobalStyle.headerFont,
								}}
							>
								Welcome, {username}
							</Text>
							<Text style={{ ...GlobalStyle.headerFont, marginBottom: 15 }}>
								What would you like to do?
							</Text>
						</View>

						<View style={{ marginHorizontal: 22 }}>
							<View
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
									alignItems: "center",
									marginTop: 12,
								}}
							>
								<Text
									style={{
										fontSize: 18,
										...GlobalStyle.headerFont,
										marginVertical: 12,
									}}
								>
									Latest Feedback
								</Text>
								<Button
									title="View all"
									onPress={() => navigation.navigate("InquiriesNFeedback")}
									filled
									style={{
										width: "30%",
										alignContent: "center",
										borderColor: 0,
										elevation: 2,
										borderRadius: 12,
									}}
								/>
							</View>

							<View
								style={{
									flexDirection: "row",
									flexWrap: "wrap",
									marginBottom: 10,
									alignContent: "center",
									justifyContent: "center",
								}}
							>
								{loading ? (
									<Text>Loading latest feedback...</Text>
								) : (
									<TouchableOpacity
										onPress={navigateToRespond}
										style={{
											height: 200,
											elevation: 2,
											backgroundColor: COLORS.grey,
											marginTop: 10,
											borderRadius: 15,
											marginBottom: 10,
											width: "100%",
											padding: 20,
										}}
									>
										<Text style={{ ...GlobalStyle.headerFont }}>Location:</Text>
										<CustomText>{newFeedbackData.venueName}</CustomText>
										<Text style={{ ...GlobalStyle.headerFont }}>Date:</Text>
										<CustomText>
											{newFeedbackData.feedback.feedbackDate}
										</CustomText>
										<View style={{ flexDirection: "row" }}>
											<Text style={{ fontStyle: "italic" }}>
												{newFeedbackData.feedback.username}
											</Text>
											<Text style={{ ...GlobalStyle.headerFont }}>
												{"  "} sent a feedback:
											</Text>
										</View>
										<CustomText>
											{newFeedbackData.feedback.feedbackDescription}
										</CustomText>
									</TouchableOpacity>
								)}
							</View>

							<Text
								style={{
									fontSize: 18,
									...GlobalStyle.headerFont,
									marginVertical: 12,
								}}
							>
								Profile
							</Text>
							<View
								style={{
									flexDirection: "row",
									flexWrap: "wrap",
									marginBottom: 10,
								}}
							>
								{/* venue profile */}
								<TouchableOpacity
									onPress={() => navigation.navigate("VenueProfile")}
									style={styles.container}
								>
									<CustomText>Venue Profile</CustomText>
									<View
										style={{ alignItems: "center", justifyContent: "center" }}
									>
										<FontAwesome5
											name="house-user"
											size={34}
											color={COLORS.foam}
										/>
									</View>
								</TouchableOpacity>

								{/* manage inventory */}
								<TouchableOpacity
									onPress={() => navigation.navigate("ManageInventory")}
									style={styles.container}
								>
									<CustomText>Manage Inventory</CustomText>
									<View
										style={{ alignItems: "center", justifyContent: "center" }}
									>
										<FontAwesome5
											name="warehouse"
											size={34}
											color={COLORS.foam}
										/>
									</View>
								</TouchableOpacity>
							</View>

							{/* social */}
							<Text
								style={{
									fontSize: 18,
									...GlobalStyle.headerFont,
									marginVertical: 12,
								}}
							>
								Social
							</Text>
							<View
								style={{
									flexDirection: "row",
									flexWrap: "wrap",
									marginBottom: 10,
								}}
							>
								{/* create events */}
								<TouchableOpacity
									onPress={() => navigation.navigate("CreateEvents")}
									style={styles.container}
								>
									<CustomText>Create Events</CustomText>
									<View
										style={{ alignItems: "center", justifyContent: "center" }}
									>
										<FontAwesome5
											name="speakap"
											size={44}
											color={COLORS.foam}
										/>
									</View>
								</TouchableOpacity>
							</View>

							{/* analytics */}
							<View
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
									alignItems: "center",
									marginTop: 12,
								}}
							>
								<Text
									style={{
										fontSize: 18,
										...GlobalStyle.headerFont,
										marginVertical: 12,
									}}
								>
									Beer Analytics
								</Text>
								<Button
									title="See more"
									onPress={() => navigation.navigate("Analytics")}
									filled
									style={{
										width: "30%",
										alignContent: "center",
										borderColor: 0,
										elevation: 2,
										borderRadius: 12,
									}}
								/>
							</View>
							<TouchableOpacity
								onPress={handlePopup}
								style={{
									height: 350,
									elevation: 2,
									backgroundColor: COLORS.grey,
									marginTop: 10,
									borderRadius: 15,
									marginBottom: 10,
									width: "100%",
									padding: 20,
								}}
							>
								<Text style={{ ...GlobalStyle.headerFont, fontSize: 16 }}>
									Most Popular Beer
								</Text>

								{isLoading ? (
									<Text>Loading...</Text>
								) : popularData ? (
									<View>
										<Image
											source={{ uri: popularData.mostPopularBeer.beerImage }}
											style={styles.beerImage}
										/>
										<Text
											style={{
												...GlobalStyle.headerFont,
												justifyContent: "center",
												alignContent: "center",
												alignSelf: "center",
											}}
										>
											{popularData.mostPopularBeer.beerName}
										</Text>
										<Modal
											visible={popupVisible}
											transparent
											animationType="fade"
										>
											<View
												style={{
													width: "100%",
													height: "100%",
													backgroundColor: COLORS.secondary,
													borderRadius: 10,
													paddingHorizontal: 20,
													elevation: 5,
												}}
											>
												<Image
													source={{
														uri: popularData.mostPopularBeer.beerImage,
													}}
													style={styles.beerImage}
												/>
												<CustomText
													style={{
														fontSize: 18,
														textAlign: "center",
													}}
												>
													{popularData.mostPopularBeer.beerName} -- $
													{popularData.mostPopularBeer.price}
												</CustomText>
												<View
													style={{
														flexDirection: "row",
														justifyContent: "space-between",
														alignItems: "center",
													}}
												></View>
												<View
													style={{
														flexDirection: "row",
														justifyContent: "space-between",
														alignItems: "center",
														elevation: 5,
													}}
												>
													<CustomText style={{ marginBottom: 12 }}>
														Alcohol%: {popularData.mostPopularBeer.abv}
													</CustomText>
													<CustomText style={{ marginBottom: 12 }}>
														Bitter Units: {popularData.mostPopularBeer.ibu}
													</CustomText>
												</View>
												<CustomText style={{ fontSize: 17 }}>
													Description
												</CustomText>
												<CustomText>
													{popularData.mostPopularBeer.beerDescription}
												</CustomText>
												<Button
													title="Close"
													onPress={handlePopup}
													filled
													style={{
														marginTop: 12,
														marginBottom: 12,
														borderColor: 0,
														elevation: 2,
														borderRadius: 12,
													}}
												/>
											</View>
										</Modal>
									</View>
								) : (
									<Text>No most popular beer data found.</Text>
								)}
							</TouchableOpacity>

							{/* venue comparison  */}
							<View
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
									alignItems: "center",
									marginTop: 12,
								}}
							>
								<Text
									style={{
										fontSize: 18,
										...GlobalStyle.headerFont,
										marginVertical: 12,
									}}
								>
									Venue Analytics
								</Text>
								<Button
									title="See more"
									onPress={() => navigation.navigate("VenueComparison")}
									filled
									style={{
										width: "30%",
										alignContent: "center",
										borderColor: 0,
										elevation: 2,
										borderRadius: 12,
									}}
								/>
							</View>
							<TouchableOpacity
								onPress={handlePopUp2}
								style={{
									height: 320,
									elevation: 2,
									backgroundColor: COLORS.grey,
									marginTop: 10,
									borderRadius: 15,
									marginBottom: 10,
									width: "100%",
									padding: 20,
								}}
							>
								<Text style={{ ...GlobalStyle.headerFont, fontSize: 16 }}>
									Most Popular Venue
								</Text>
								{isLoading2 ? (
									<Text>Loading...</Text>
								) : popularVenueData ? (
									<View>
										<Image
											source={{
												uri: popularVenueData.mostPopularVenue.venueImage,
											}}
											style={styles.venueImage}
										/>
										<Text
											style={{
												...GlobalStyle.headerFont,
												justifyContent: "center",
												alignItems: "center",
												alignSelf: "center",
											}}
										>
											{popularVenueData.mostPopularVenue.venueName}
										</Text>
										<Modal
											visible={popupVisible2}
											transparent
											animationType="fade"
										>
											<View
												style={{
													width: "100%",
													height: "100%",
													backgroundColor: COLORS.secondary,
													borderRadius: 10,
													paddingHorizontal: 20,
													elevation: 5,
												}}
											>
												<ScrollView
													contentContainerStyle={{
														flexGrow: 1,
														paddingBottom: 30,
													}}
													showsVerticalScrollIndicator={false}
												>
													<Image
														source={{
															uri: popularVenueData.mostPopularVenue.venueImage,
														}}
														style={styles.venueImage}
													/>
													<CustomText
														style={{
															fontSize: 18,
															textAlign: "center",
															marginBottom: 12,
														}}
													>
														{popularVenueData.mostPopularVenue.venueName}
													</CustomText>
													<View style={{ marginHorizontal: 12 }}>
														<View
															style={{
																flexDirection: "row",
																alignItems: "center",
																marginBottom: 12,
															}}
														>
															<View
																style={{
																	flexDirection: "row",
																	alignItems: "center",
																}}
															>
																<Entypo
																	name="location-pin"
																	size={24}
																	color={COLORS.black}
																/>
																<CustomText
																	style={{
																		flexWrap: "wrap",
																		marginLeft: 4,
																		maxWidth: "65%",
																	}}
																>
																	{
																		popularVenueData.mostPopularVenue
																			.venueAddress
																	}
																</CustomText>
															</View>
															<View
																style={{
																	flexDirection: "row",
																	alignItems: "center",
																	marginHorizontal: 12,
																}}
															>
																<FontAwesome
																	name="phone"
																	size={24}
																	color={COLORS.black}
																	style={{ marginRight: 4 }}
																/>
																<CustomText
																	style={{
																		flexWrap: "wrap",
																		maxWidth: "80%",
																	}}
																>
																	{
																		popularVenueData.mostPopularVenue
																			.venueContact
																	}
																</CustomText>
															</View>
														</View>
														<CustomText>
															Average Beer Freshness:{" "}
															{popularVenueData.mostPopularVenue.venueFreshness}
														</CustomText>
														<CustomText>
															Average Beer Temperature:{" "}
															{
																popularVenueData.mostPopularVenue
																	.venueTemperature
															}
														</CustomText>
														<View
															style={{
																borderTopColor: "black",
																borderBottomWidth: 1,
																marginTop: 5,
															}}
														></View>
														<View
															style={{
																flexDirection: "row",
																justifyContent: "space-between",
																alignItems: "center",
																marginTop: 12,
																marginBottom: 12,
															}}
														>
															<CustomText style={{ fontSize: 16 }}>
																Ratings:{" "}
															</CustomText>
															<View
																style={{
																	flexDirection: "row",
																	paddingTop: 6,
																}}
															>
																{[1, 2, 3, 4, 5].map((star) => (
																	<Ionicons
																		key={star}
																		name="star"
																		size={16}
																		color={
																			star <=
																			popularVenueData.mostPopularVenue
																				.venueRating
																				? COLORS.foam
																				: COLORS.grey
																		}
																		style={{ marginBottom: 9 }}
																	/>
																))}
															</View>
														</View>
													</View>
													<Button
														title="Close"
														onPress={handlePopUp2}
														filled
														style={{
															marginTop: 12,
															marginBottom: 12,
															borderColor: 0,
															elevation: 2,
															borderRadius: 12,
														}}
													/>
												</ScrollView>
											</View>
										</Modal>
									</View>
								) : (
									<Text>No most popular venue data found.</Text>
								)}
							</TouchableOpacity>
						</View>
					</ScrollView>
				</SafeAreaView>
			</SafeAreaView>
		</View>
	);
};

const styles = StyleSheet.create({
	button: {
		paddingVertical: 10,
		borderColor: COLORS.black,
		borderWidth: 1,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	container: {
		height: 100,
		elevation: 2,
		backgroundColor: COLORS.grey,
		marginLeft: 10,
		marginTop: 10,
		borderRadius: 15,
		marginBottom: 3,
		width: "45%",
		alignItems: "center",
		justifyContent: "center",
	},
	beerImage: {
		height: 230,
		width: 250,
		borderRadius: 15,
		borderWidth: 5,
		borderColor: 0,
		marginTop: 20,
		marginLeft: "auto",
		marginRight: "auto",
		justifyContent: "center",
		alignContent: "center",
		marginBottom: 10,
		alignSelf: "center",
	},
	venueImage: {
		height: 200,
		width: 310,
		borderRadius: 15,
		borderWidth: 5,
		borderColor: 0,
		marginTop: 20,
		marginLeft: "auto",
		marginRight: "auto",
		justifyContent: "center",
		alignContent: "center",
		marginBottom: 10,
		alignSelf: "center",
	},
});

export default VenueOwnerHome;
