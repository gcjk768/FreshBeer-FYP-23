import {
	Entypo,
	FontAwesome,
	Ionicons,
	MaterialIcons,
	Octicons,
} from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
	Alert,
	Animated,
	Easing,
	Image,
	Modal,
	PanResponder,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { Header } from "react-native-elements";
import { AirbnbRating } from "react-native-ratings";
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

// custom alert for wishist removal
const CustomWishlistAlert = ({ visible, onClose, title, message }) => {
	return (
		<Modal visible={visible} transparent animationType="fade">
			<View
				style={{
					flex: 1,
					backgroundColor: "rgba(0, 0, 0, 0.5)",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<View
					style={{
						width: "80%",
						backgroundColor: COLORS.white,
						borderRadius: 20,
						padding: 30,
					}}
				>
					<Ionicons
						name="md-beer"
						size={34}
						color={COLORS.foam}
						style={{ alignSelf: "center" }}
					/>
					<Text
						style={{
							fontSize: 18,
							...GlobalStyle.headerFont,
							alignSelf: "center",
							marginBottom: 20,
						}}
					>
						{title}
					</Text>
					<CustomText
						style={{
							alignSelf: "center",
							fontSize: 16,
							marginBottom: 20,
						}}
					>
						{message}
					</CustomText>
					<TouchableOpacity
						style={{
							backgroundColor: COLORS.foam,
							padding: 10,
							borderRadius: 8,
							alignItems: "center",
							marginTop: 20,
						}}
						onPress={onClose}
					>
						<Text style={{ ...GlobalStyle.headerFont, fontSize: 16 }}>OK</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

const BeerItem = ({
	beerID,
	beerName,
	price,
	rating,
	beerDescription,
	beerImage,
	ABV,
	IBU,
	onSlide,
}) => {
	const [popupVisible, setPopupVisible] = useState(false); // beer names popup
	const [beerLocation, setBeerLocation] = useState([]);
	const [userID, setUserID] = useState("");
	const { cookies } = useCookies();
	const slideAnim = useRef(new Animated.Value(0)).current;

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onPanResponderMove: (_, gestureState) => {
				slideAnim.setValue(gestureState.dx);
			},
			onPanResponderRelease: (_, gestureState) => {
				if (gestureState.dx > 50) {
					const type = "beer";
					onSlide(type, beerID);
				}

				Animated.spring(slideAnim, {
					toValue: 0,
					useNativeDriver: false,
				}).start();
			},
		})
	).current;

	const handlePopup = () => {
		setPopupVisible(!popupVisible); // created 1st modal
	};

	// for beer locations
	useEffect(() => {
		setUserID(cookies.userID);

		const fetchBeerLocations = async () => {
			try {
				const response = await axios.get(
					"https://fresh-beer-near-me-6e244313be42.herokuapp.com/getBeerLocation",
					{
						params: { beerID },
					}
				);
				const { success, venues } = response.data;

				if (success) {
					setBeerLocation(venues);
				}
			} catch (error) {
				console.error("Error fetching beer location:", error);
			}
		};

		if (popupVisible) {
			fetchBeerLocations();
		}
	}, [popupVisible]);

	return (
		<Animated.View
			style={{
				transform: [{ translateX: slideAnim }],
			}}
			{...panResponder.panHandlers}
		>
			<View style={styles.subContainer}>
				<TouchableOpacity style={styles.itemContainer} onPress={handlePopup}>
					<View style={{ flex: 1, paddingHorizontal: 6, paddingTop: 6 }}>
						<CustomText>{beerName}</CustomText>
						<CustomText>Price: ${price}</CustomText>
					</View>
					<View>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								paddingTop: 6,
							}}
						>
							{[1, 2, 3, 4, 5].map((star) => (
								<Ionicons
									key={star}
									name="star"
									size={16}
									color={star <= rating ? COLORS.foam : COLORS.grey}
								/>
							))}
						</View>
					</View>
				</TouchableOpacity>

				{/* beer popup */}
				<Modal visible={popupVisible} transparent animationType="fade">
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
						<ScrollView showsVerticalScrollIndicator={false}>
							<Image source={{ uri: beerImage }} style={styles.beerImage} />
							<CustomText
								style={{
									fontSize: 18,
									textAlign: "center",
								}}
							>
								{beerName} -- ${price}
							</CustomText>
							<View
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<View
									style={{
										flex: 1,
										flexDirection: "row",
										justifyContent: "flex-end",
										paddingTop: 16,
										marginBottom: 15,
									}}
								>
									{[1, 2, 3, 4, 5].map((star) => (
										<Ionicons
											key={star}
											name="star"
											size={16}
											color={star <= rating ? COLORS.foam : COLORS.grey}
											style={{ marginBottom: 4 }}
										/>
									))}
								</View>
							</View>
							<View
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
									alignItems: "center",
									elevation: 5,
								}}
							>
								<CustomText style={{ marginBottom: 12 }}>
									Alcohol%: {ABV}
								</CustomText>
								<CustomText style={{ marginBottom: 12 }}>
									Bitter Units: {IBU}
								</CustomText>
							</View>
							<CustomText style={{ fontSize: 17 }}>Description</CustomText>
							<CustomText>{beerDescription}</CustomText>
							<Text
								style={{
									...GlobalStyle.headerFont,
									fontSize: 17,
									marginBottom: 10,
									marginTop: 10,
								}}
							>
								Locations
							</Text>
							{beerLocation.map((location) => (
								<View key={location.venueID}>
									<CustomText>{location.venueName}</CustomText>
								</View>
							))}
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
						</ScrollView>
					</View>
				</Modal>
			</View>
		</Animated.View>
	);
};

const VenueItem = ({
	venueID,
	venueName,
	venueAddress,
	venueContact,
	venueRating,
	venueImage,
	venueOperatingHours,
	venueFreshness,
	venueTemperature,
	onSlide,
}) => {
	const [popupVisible, setPopupVisible] = useState(false);
	const [venueMenu, setVenueMenu] = useState([]);
	const [userID, setUserID] = useState("");
	const { cookies } = useCookies();
	const slideAnim = useRef(new Animated.Value(0)).current;

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onPanResponderMove: (_, gestureState) => {
				slideAnim.setValue(gestureState.dx);
			},
			onPanResponderRelease: (_, gestureState) => {
				if (gestureState.dx > 50) {
					const type = "venue";
					onSlide(type, venueID);
				}

				Animated.spring(slideAnim, {
					toValue: 0,
					useNativeDriver: false,
				}).start();
			},
		})
	).current;

	const handlePopup = () => {
		setPopupVisible(!popupVisible);
	};

	useEffect(() => {
		setUserID(cookies.userID);
		const fetchVenueMenu = async () => {
			try {
				const response = await axios.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getVenueMenu", {
					params: { venueID },
				});
				const { success, beers } = response.data;

				if (success) {
					setVenueMenu(beers);
				}
			} catch (error) {
				console.error("Error fetching venue menu:", error);
			}
		};

		if (popupVisible) {
			fetchVenueMenu();
		}
	}, [popupVisible]);

	return (
		<Animated.View
			style={{
				transform: [{ translateX: slideAnim }],
			}}
			{...panResponder.panHandlers}
		>
			<View style={styles.subContainer}>
				<TouchableOpacity style={styles.itemContainer} onPress={handlePopup}>
					<View style={{ flex: 1, paddingHorizontal: 6, paddingTop: 6 }}>
						<CustomText>{venueName}</CustomText>
					</View>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							paddingTop: 6,
						}}
					>
						{[1, 2, 3, 4, 5].map((star) => (
							<Ionicons
								key={star}
								name="star"
								size={16}
								color={star <= venueRating ? COLORS.foam : COLORS.grey}
							/>
						))}
					</View>
				</TouchableOpacity>

				{/* venue popup  */}
				<Modal visible={popupVisible} transparent animationType="fade">
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
							contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
							showsVerticalScrollIndicator={false}
						>
							<Image source={{ uri: venueImage }} style={styles.venueImage} />
							<CustomText
								style={{
									fontSize: 18,
									textAlign: "center",
									marginBottom: 12,
								}}
							>
								{venueName}
							</CustomText>
							<View style={{ marginHorizontal: 12 }}>
								<View
									style={{
										flexDirection: "row",
										alignItems: "center",
										marginBottom: 12,
									}}
								>
									<View style={{ flexDirection: "row", alignItems: "center" }}>
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
											{venueAddress}
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
											{venueContact}
										</CustomText>
									</View>
								</View>

								<View
									style={{
										width: "100%",
										borderColor: 0,
										paddingHorizontal: 20,
										paddingVertical: 10,
										borderRadius: 30,
										marginBottom: 25,
										backgroundColor: COLORS.grey,
										elevation: 2,
									}}
								>
									<CustomText
										style={{
											fontSize: 18,
										}}
									>
										Operating Hours{" "}
									</CustomText>
									<View>
										{venueOperatingHours.split("\n").map((line, index) => (
											<View
												key={index}
												style={{
													flexDirection: "row",
													justifyContent: "space-between",
												}}
											>
												<Text
													style={{
														...GlobalStyle.headerFont,
														fontSize: 14,
														flex: 1,
													}}
												>
													{line.split(" ")[0]}
												</Text>
												<CustomText style={{ justifyContent: "flex-end" }}>
													{line.substring(line.indexOf(" ") + 1)}
												</CustomText>
											</View>
										))}
									</View>
								</View>
								<CustomText>
									Average Beer Freshness: {venueFreshness}
								</CustomText>
								<CustomText>
									Average Beer Temperature: {venueTemperature}
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
									<CustomText style={{ fontSize: 16 }}>Ratings: </CustomText>
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
												color={star <= venueRating ? COLORS.foam : COLORS.grey}
												style={{ marginBottom: 9 }}
											/>
										))}
									</View>
								</View>
								<View
									style={{
										borderTopColor: "black",
										borderTopWidth: 1,
									}}
								></View>
								<CustomText
									style={{ fontSize: 16, marginTop: 12, marginBottom: 12 }}
								>
									Menu
								</CustomText>

								<View style={{ flexDirection: "row", flexWrap: "wrap" }}>
									{venueMenu.map((beer) => (
										<View
											key={beer.beerID}
											style={{
												width: "45%",
												marginHorizontal: 8,
												marginBottom: 20,
												borderRadius: 15,
												backgroundColor: COLORS.secondary,
												elevation: 5,
											}}
										>
											<View
												style={{
													marginTop: 12,
													alignItems: "center",
													justifyContent: "center",
												}}
											>
												<Image
													source={{ uri: beer.beerImage }}
													style={{
														borderRadius: 12,
														height: 120,
														width: 120,
													}}
												/>
											</View>
											<View style={{ marginTop: 12, paddingHorizontal: 10 }}>
												<Text
													style={{
														...GlobalStyle.headerFont,
														fontSize: 13,
														marginBottom: 6,
													}}
												>
													{beer.beerName}
												</Text>
												<View
													style={{
														flexDirection: "row",
														justifyContent: "space-between",
														marginBottom: 6,
													}}
												>
													<CustomText style={{ marginRight: 5 }}>
														ABV: {beer.abv}
													</CustomText>
													<CustomText style={{ marginRight: 5 }}>
														IBU: {beer.ibu}
													</CustomText>
												</View>
												<Text
													style={{
														...GlobalStyle.headerFont,
														fontSize: 14,
														marginBottom: 12,
													}}
												>
													${beer.price}
												</Text>
											</View>
										</View>
									))}
								</View>
								<Button
									title="Close"
									onPress={handlePopup}
									filled
									style={{
										elevation: 2,
										borderColor: 0,
									}}
								/>
							</View>
						</ScrollView>
					</View>
				</Modal>
			</View>
		</Animated.View>
	);
};

const Wishlist = ({ navigation }) => {
	const [wishlistData, setWishlistData] = useState([]);
	const [removedWishlistState, setRemovedWishlistState] = useState(false);
	const { cookies } = useCookies();
	const [isWishlistVisible, setIsWishlistVisible] = useState(false);
	const [WishlistTitle, setWishlistTitle] = useState("");
	const [WishlistMessage, setWishlistMessage] = useState("");
	const [showInstructions, setShowInstructions] = useState(true);

	useEffect(() => {
		axios
			.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getWishlist", {
				params: {
					userID: cookies.userID,
				},
			})
			.then((response) => {
				setWishlistData(response.data);
				setRemovedWishlistState(false);
			})
			.catch((error) => {
				console.error("Error retrieving wishlist", error);
			});
	}, [removedWishlistState]);

	const handleSlide = (type, ID) => {
		let data = { userID: cookies.userID };

		if (type === "beer") {
			data = { ...data, beerID: ID };
		} else if (type === "venue") {
			data = { ...data, venueID: ID };
		}
		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/removeWishlist", data)
			.then((response) => {
				if (response.data.success) {
					setWishlistTitle("Success");
					setWishlistMessage("Removed from wishlist!");
					setRemovedWishlistState(true);
				} else {
					const { message } = response.data;
					setWishlistTitle("Error");
					setWishlistMessage(message);
				}
				setIsWishlistVisible(true);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	const hideInstructions = () => {
		setShowInstructions(false);
	};

	return (
		<View style={{ flex: 1 }}>
			<SafeAreaView style={{ flex: 1 }} backgroundColor={COLORS.secondary}>
				{/* Walkthrough instructions */}
				{showInstructions && (
					<View
						style={{
							backgroundColor: "rgba(0, 0, 0, 0.5)",
							position: "absolute",
							height: "100%",
							width: "100%",
							justifyContent: "center",
							alignItems: "center",
							zIndex: 1,
						}}
					>
						<View
							style={{
								width: "80%",
								backgroundColor: COLORS.white,
								borderRadius: 20,
								padding: 30,
							}}
						>
							<Ionicons
								name="md-beer"
								size={34}
								color={COLORS.foam}
								style={{ alignSelf: "center" }}
							/>
							<Text
								style={{
									fontSize: 18,
									...GlobalStyle.headerFont,
									alignSelf: "center",
									marginBottom: 20,
								}}
							>
								Welcome
							</Text>
							<CustomText
								style={{
									alignSelf: "center",
									fontSize: 16,
									marginBottom: 20,
								}}
							>
								Slide to remove from your wishlist!
							</CustomText>
							<TouchableOpacity
								style={{
									backgroundColor: COLORS.foam,
									padding: 10,
									borderRadius: 8,
									alignItems: "center",
									marginTop: 20,
								}}
								onPress={hideInstructions}
							>
								<Text style={{ ...GlobalStyle.headerFont, fontSize: 16 }}>
									OK
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				)}
				<Header
					placement="left"
					backgroundColor={COLORS.primary}
					containerStyle={{
						height: 100,
						borderBottomLeftRadius: 40,
						borderBottomRightRadius: 40,
					}}
					leftComponent={
						<View
							style={{
								flexDirection: "row",
							}}
						>
							<TouchableOpacity onPress={() => navigation.goBack()}>
								<MaterialIcons
									name="keyboard-arrow-left"
									size={24}
									color={COLORS.black}
								/>
							</TouchableOpacity>
						</View>
					}
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
					<ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
						<View style={{ marginHorizontal: 22 }}>
							<Text
								style={{
									...GlobalStyle.headerFont,
									fontSize: 18,
									marginVertical: 12,
								}}
							>
								My Wishlist
							</Text>
							{wishlistData?.wishlistArray?.map((item) => {
								if (item.beerID) {
									return (
										<BeerItem
											key={item.beerID}
											beerID={item.beerID}
											beerName={item.beerName}
											price={item.price}
											rating={item.rating}
											beerDescription={item.beerDescription}
											beerImage={item.beerImage}
											ABV={item.abv}
											IBU={item.ibu}
											communityReviews={item.communityReviews}
											venueAvailability={item.venueAvailability}
											onSlide={handleSlide}
										/>
									);
								} else if (item.venueID) {
									return (
										<VenueItem
											key={item.venueID}
											venueID={item.venueID}
											venueName={item.venueName}
											venueAddress={item.venueAddress}
											venueContact={item.venueContact}
											venueRating={item.venueRating}
											venueImage={item.venueImage}
											venueOperatingHours={item.venueOperatingHours}
											venueFreshness={item.venueFreshness}
											venueTemperature={item.venueTemperature}
											onSlide={handleSlide}
										/>
									);
								}
								return null;
							})}
							<CustomWishlistAlert
								visible={isWishlistVisible}
								onClose={() => setIsWishlistVisible(false)}
								title={WishlistTitle}
								message={WishlistMessage}
							/>
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
	containerItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
		backgroundColor: COLORS.grey,
		height: 50,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: 0,
		paddingHorizontal: 20,
		elevation: 2,
	},
	itemContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
		borderColor: 0,
	},
	subContainer: {
		marginBottom: 10,
		backgroundColor: COLORS.white,
		padding: 10,
		borderRadius: 12,
		borderWidth: 1,
		shadowColor: COLORS.black, // Add shadow color
		shadowOffset: { width: 0, height: 2 }, // Add shadow offset
		shadowOpacity: 0.3, // Add shadow opacity
		shadowRadius: 3, // Add shadow radius
		elevation: 5, // Add elevation for Android
		borderColor: 0,
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
		width: 320,
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

export default Wishlist;
