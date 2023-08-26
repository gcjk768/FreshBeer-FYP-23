import { Ionicons, MaterialIcons, Octicons } from "@expo/vector-icons";
import { Card, Tab, TabView, ThemeProvider } from "@rneui/themed";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	ImageBackground,
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

// CODES TO STYLE BUTTON
const Button = (props) => {
	const filledBgColor = props.color || COLORS.primary;
	const outlinedColor = COLORS.white;
	const bgColor = props.filled ? filledBgColor : outlinedColor;
	const textColor = props.filled ? COLORS.black : COLORS.primary;

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

const Dashboard = ({ navigation }) => {
	const { cookies } = useCookies();
	const [index, setIndex] = React.useState(0);
	const [index1, setIndex1] = React.useState(0);
	const [username, setUsername] = useState("");
	const [personalisedData, setPersonalisedData] = useState([]);
	const [eventData, setEventData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedBeerName, setSelectedBeerName] = useState("");
	const [selectedEvent, setSelectedEvent] = useState(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const eventImageMapping = {
		event1: require("../../assets/event1.png"),
		event2: require("../../assets/event2.png"),
		event3: require("../../assets/event3.png"),
		event4: require("../../assets/event4.png"),
		event5: require("../../assets/event5.png"),
	};

	const getRandomEventImage = (index) => {
		const eventImageArray = Object.keys(eventImageMapping);
		const eventImageIndex = index % eventImageArray.length;
		return eventImageMapping[eventImageArray[eventImageIndex]];
	};

	useEffect(() => {
		const sessionToken = cookies.sessionToken;
		const userID = cookies.userID;
		setUsername(cookies.username);
	}, []);

	useEffect(() => {
		axios
			.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getPersonalisedRecommendation", {
				params: {
					userID: cookies.userID,
				},
			})
			.then((response) => {
				setPersonalisedData(response.data);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error("Error retrieving personalised reccommendation", error);
				setIsLoading(false);
			});
	}, []);

	useEffect(() => {
		axios
			.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getUpcomingEvents")
			.then((response) => {
				const eventsWithImages = response.data.map((event, index) => ({
					...event,
					randomEventImage: getRandomEventImage(index),
				}));
				setEventData(eventsWithImages);
			})
			.catch((error) => {
				console.error("Error retrieving events", error);
			});
	}, []);

	const EventModal = ({ visible, event, onClose }) => {
		return (
			<Modal visible={visible} transparent animationType="slide">
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
					<TouchableOpacity onPress={onClose}>
						<Ionicons
							name="arrow-back"
							size={24}
							color={COLORS.black}
							style={{ marginVertical: 12 }}
						/>
					</TouchableOpacity>
					{event ? (
						<>
							<Text style={{ ...GlobalStyle.headerFont, fontSize: 18 }}>
								{event.eventTitle}
							</Text>
							<Text style={{ ...GlobalStyle.headerFont, fontSize: 14 }}>
								{event.eventDate}
							</Text>
							<CustomText style={{ marginTop: 10 }}>
								{event.eventDescription}
							</CustomText>

							<Button
								title="Close"
								onPress={onClose}
								filled
								style={{
									marginTop: 12,
									marginBottom: 12,
									borderColor: 0,
									elevation: 2,
									borderRadius: 12,
								}}
							/>
						</>
					) : (
						<View style={{ alignItems: "center", marginTop: 20 }}>
							<ActivityIndicator size="large" color={COLORS.primary} />
							<Text>Loading event details...</Text>
						</View>
					)}
				</View>
			</Modal>
		);
	};

	//=====================================================================================================
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
				/>

				<SafeAreaView style={{ flex: 1 }}>
					<ScrollView contentContainerStyle={{ paddingBottom: 70 }}>
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
								{username}, welcome back!
							</Text>
							<Text
								style={{
									fontSize: 15,
									...GlobalStyle.headerFont,
									marginBottom: 5,
								}}
							>
								What would you like to do?
							</Text>

							<View
								style={{
									flexDirection: "row",
									flexWrap: "wrap",
									marginBottom: 10,
									alignContent: "center",
									justifyContent: "center",
									marginHorizontal: 22,
								}}
							>
								<TouchableOpacity
									onPress={() => navigation.navigate("Profile")}
									style={{
										height: 100,
										elevation: 2,
										backgroundColor: COLORS.grey,
										marginTop: 10,
										borderRadius: 15,
										marginBottom: 10,
										width: 100,
										alignItems: "center",
									}}
								>
									<View
										style={{
											flexDirection: "row",
											paddingTop: 10,
											paddingHorizontal: 10,
											marginVertical: 8,
										}}
									>
										<Text
											style={{
												fontSize: 14,
												...GlobalStyle.bodyFont,
											}}
										>
											My Profile
										</Text>
									</View>
									<MaterialIcons
										name="face"
										size={44}
										color={COLORS.foam}
										style={{
											paddingLeft: 35,
											alignItems: "flex-end",
										}}
									/>
								</TouchableOpacity>

								<TouchableOpacity
									onPress={() => navigation.navigate("BeersVenue")}
									style={{
										height: 100,
										elevation: 2,
										backgroundColor: COLORS.grey,
										marginLeft: 10,
										marginTop: 10,
										borderRadius: 15,
										marginBottom: 3,
										width: 100,
										alignItems: "center",
									}}
								>
									<View
										style={{
											flexDirection: "row",
											paddingTop: 10,
											paddingHorizontal: 10,
										}}
									>
										<Text
											style={{
												fontSize: 13,
												...GlobalStyle.bodyFont,
											}}
										>
											Beers & Venues
										</Text>
									</View>
									<Ionicons
										name="beer"
										size={44}
										color={COLORS.foam}
										style={{
											paddingLeft: 35,
											alignItems: "flex-end",
										}}
									/>
								</TouchableOpacity>

								<TouchableOpacity
									onPress={() => navigation.navigate("Social")}
									style={{
										height: 100,
										elevation: 2,
										backgroundColor: COLORS.grey,
										marginLeft: 10,
										marginTop: 10,
										borderRadius: 15,
										marginBottom: 10,
										width: 100,
										alignItems: "center",
									}}
								>
									<View
										style={{
											flexDirection: "row",
											paddingTop: 10,
											paddingHorizontal: 8,
										}}
									>
										<Text
											style={{
												fontSize: 13,
												...GlobalStyle.bodyFont,
											}}
										>
											Social & Community
										</Text>
									</View>
									<Ionicons
										name="md-people-circle"
										size={44}
										color={COLORS.foam}
										style={{
											paddingLeft: 35,
											alignItems: "flex-end",
										}}
									/>
								</TouchableOpacity>

								<TouchableOpacity
									onPress={() => navigation.navigate("Feedback")}
									style={{
										height: 100,
										elevation: 2,
										backgroundColor: COLORS.grey,
										marginTop: 10,
										borderRadius: 15,
										marginBottom: 10,
										width: 100,
										justifyContent: "center",
										alignItems: "center",
									}}
								>
									<View
										style={{
											flexDirection: "row",
											paddingTop: 10,
											paddingHorizontal: 10,
										}}
									>
										<Text
											style={{
												fontSize: 13,
												...GlobalStyle.bodyFont,
											}}
										>
											Feedback & Requests
										</Text>
									</View>
									<MaterialIcons
										name="feedback"
										size={44}
										color={COLORS.foam}
										style={{
											paddingLeft: 35,
											alignItems: "flex-end",
										}}
									/>
								</TouchableOpacity>

								<TouchableOpacity
									onPress={() => navigation.navigate("Journal")}
									style={{
										height: 100,
										elevation: 2,
										backgroundColor: COLORS.grey,
										marginLeft: 10,
										marginTop: 10,
										borderRadius: 15,
										marginBottom: 10,
										width: 100,
										alignItems: "center",
									}}
								>
									<View
										style={{
											flexDirection: "column",
											paddingTop: 10,
											paddingHorizontal: 4,
											alignItems: "center",
										}}
									>
										<Text
											style={{
												fontSize: 13,
												...GlobalStyle.bodyFont,
												textAlign: "center",
												width: 100,
											}}
										>
											My Journal &
										</Text>
										<Text
											style={{
												fontSize: 13,
												...GlobalStyle.bodyFont,
												textAlign: "center",
												width: 100,
											}}
										>
											Achievements
										</Text>
									</View>
									<Ionicons
										name="journal"
										size={40}
										color={COLORS.foam}
										style={{
											paddingLeft: 35,
											alignItems: "flex-end",
										}}
									/>
								</TouchableOpacity>

								<TouchableOpacity
									onPress={() => navigation.navigate("Wishlist")}
									style={{
										height: 100,
										elevation: 2,
										backgroundColor: COLORS.grey,
										marginLeft: 10,
										marginTop: 10,
										borderRadius: 15,
										marginBottom: 10,
										width: 100,
										alignItems: "center",
									}}
								>
									<View
										style={{
											flexDirection: "row",
											paddingTop: 10,
											paddingHorizontal: 8,
											marginVertical: 10,
										}}
									>
										<Text
											style={{
												fontSize: 14,
												...GlobalStyle.bodyFont,
											}}
										>
											My Wishlist
										</Text>
									</View>
									<Ionicons
										name="list-circle"
										size={44}
										color={COLORS.foam}
										style={{
											paddingLeft: 35,
											alignItems: "flex-end",
										}}
									/>
								</TouchableOpacity>
							</View>
						</View>

						<Card
							containerStyle={{
								marginTop: 5,
								height: 280,
								backgroundColor: "transparent",
								borderColor: "transparent",
							}}
						>
							<Card.Title>Upcoming Events</Card.Title>
							<Card.Divider />

							<ThemeProvider
								theme={{
									Tab: {
										primary: {
											backgroundColor: COLORS.grey,
										},
									},
								}}
							>
								<TabView
									value={index}
									onChange={setIndex}
									animationType="spring"
								>
									{eventData.map((event, index) => (
										<TabView.Item
											key={index}
											style={{ width: "100%", marginTop: -30 }}
										>
											<Card containerStyle={styles.cardContainer}>
												<TouchableOpacity
													key={index}
													onPress={() => {
														setSelectedEvent(event);
														setIsModalVisible(true);
													}}
												>
													<ImageBackground
														source={event.randomEventImage}
														style={styles.cardImage}
													></ImageBackground>
												</TouchableOpacity>
											</Card>
										</TabView.Item>
									))}
									<EventModal
										visible={isModalVisible}
										event={selectedEvent}
										onClose={() => {
											setSelectedEvent(null);
											setIsModalVisible(false);
										}}
									/>
								</TabView>
							</ThemeProvider>
						</Card>

						<Card
							containerStyle={{
								marginTop: 5,
								height: 320,
								backgroundColor: "transparent",
								borderColor: "transparent",
							}}
						>
							{isLoading ? (
								<View style={{ alignItems: "center", marginTop: 20 }}>
									<ActivityIndicator size="large" color={COLORS.primary} />
									<Text>Loading...</Text>
								</View>
							) : (
								<ThemeProvider
									theme={{
										Tab: {
											primary: {
												backgroundColor: COLORS.grey,
											},
										},
									}}
								>
									<Card.Title>
										Since you like {personalisedData.mostFrequentCategory}...
									</Card.Title>
									<Card.Divider />
									<TabView
										value={index1}
										onChange={setIndex1}
										animationType="spring"
									>
										{personalisedData.recommendedBeers.map((beer, index) => (
											<TabView.Item
												key={index}
												style={{ width: "100%", marginTop: -30 }}
											>
												<Card containerStyle={styles.cardContainer}>
													<TouchableOpacity
														onPress={() => setSelectedBeerName(beer.beerName)}
													>
														<ImageBackground
															source={{ uri: beer.beerImage }}
															style={{
																width: "100%",
																height: 250,
																resizeMode: "cover",
																borderRadius: 10,
																overflow: "hidden",
															}}
														>
															{selectedBeerName === beer.beerName && (
																<View
																	style={{
																		position: "absolute",
																		marginTop: -30,
																		left: 0,
																		right: 0,
																		bottom: 0,
																		justifyContent: "center",
																		alignItems: "center",
																	}}
																>
																	<View
																		style={{
																			backgroundColor: "rgba(0, 0, 0, 1.0)",
																			padding: 10,
																		}}
																	>
																		<Text
																			style={{
																				...GlobalStyle.headerFont,
																				color: COLORS.secondary,
																			}}
																		>
																			{beer.beerName}
																		</Text>
																	</View>
																</View>
															)}
														</ImageBackground>
													</TouchableOpacity>
												</Card>
											</TabView.Item>
										))}
									</TabView>
								</ThemeProvider>
							)}
						</Card>
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
	cardContainer: {
		height: 10,
		borderRadius: 10,
		marginBottom: 5,
		borderWidth: 0, // Make the border transparent
		shadowColor: "transparent", // Make the shadow color transparent
		elevation: 0, // Remove the elevation (shadow effect)
	},
	card: {
		width: "100%",
		height: 150,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
		padding: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.5,
		shadowRadius: 2,
		elevation: 5,
	},
	cardImage: {
		width: "100%",
		height: 200,
		resizeMode: "cover",
		borderRadius: 10,
		overflow: "hidden",
	},
	tabView: {
		flex: 1,
		flexDirection: "row",
		width: "100%",
		height: "100%",
		justifyContent: "space-between",
		alignItems: "center",
		position: "absolute",
		top: 0,
		left: 0,
	},
});

export default Dashboard;
