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

// custom alert for adding wishist
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

// for popup
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
	const [popupVisible2, setPopupVisible2] = useState(false); // created 2nd modal
	const [popupVisible3, setPopupVisible3] = useState(false); // created 3rd modal
	const [venueMenu, setVenueMenu] = useState([]);
	const [venueReview, setVenueReview] = useState([]);
	const [ratingCounter, setRatingCounter] = useState({});
	const [reviewText, setReviewText] = useState("");
	const [rating, setRating] = useState(0);
	const { cookies } = useCookies();
	const [userID, setUserID] = useState("");
	const [reviewAdded, setReviewAdded] = useState(false);
	const slideAnim = useRef(new Animated.Value(0)).current;

	const HorizontalBarChart = ({ ratingCounter }) => {
		const data = Object.entries(ratingCounter).map(([key, value]) => {
			return { label: key + "*", value: parseInt(value) };
		});
		const maxValue = Math.max(...data.map((item) => item.value));

		return (
			<View>
				{data.map((item, index) => (
					<View key={index} style={styles.barContainer}>
						<Text
							style={{
								marginRight: 8,
							}}
						>
							{item.label}
						</Text>
						<View
							style={[
								styles.bar,
								{ width: (item.value / maxValue) * 100 + "%" },
							]}
						/>
					</View>
				))}
			</View>
		);
	};

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onPanResponderMove: (_, gestureState) => {
				slideAnim.setValue(gestureState.dx);
			},
			onPanResponderRelease: (_, gestureState) => {
				if (gestureState.dx > 50) {
					onSlide(venueID);
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

	const handlePopUp2 = () => {
		setPopupVisible2(!popupVisible2); // created 2nd modal
	};

	const handlePopUp3 = () => {
		setPopupVisible3(!popupVisible3); // created 3rd modal
	};

	const handleReviewTextChange = (text) => {
		setReviewText(text);
	};

	const handleRatingChange = (ratingValue) => {
		setRating(ratingValue);
	};

	const generateRandomNumber = () => {
		const min = 1000000;
		const max = 10000000;
		const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
		return randomNumber;
	};

	const handleSubmit = () => {
		const currentDate = new Date();

		const day = currentDate.getDate();
		const month = currentDate.getMonth() + 1;
		const year = currentDate.getFullYear();

		const formattedDate = `${day}/${month}/${year}`;

		const data = {
			reviewText: reviewText,
			rating: rating,
			userID: userID,
			reviewDate: formattedDate,
			venueID: venueID,
		};

		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/addVenueReview", data)
			.then((response) => {
				if (response.data.success) {
					console.log("Review Added");

					const newReview = {
						reviewID: generateRandomNumber(),
						reviewUser: cookies.username,
						reviewDate: formattedDate,
						reviewDescription: reviewText,
						reviewRating: rating,
					};

					setVenueReview((prevReviews) => [...prevReviews, newReview]);

					setRatingCounter((prevCounter) => {
						const newCounter = { ...prevCounter };
						if (newCounter.hasOwnProperty(rating)) {
							newCounter[rating] += 1;
						} else {
							newCounter[rating] = 1;
						}
						return newCounter;
					});
					setReviewAdded(true);
				}
			})
			.catch((error) => {
				console.error(error);
			});

		setReviewText("");
		setRating(0);
		handlePopUp3();
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

		const fetchVenueReview = async () => {
			try {
				const response = await axios.get(
					"https://fresh-beer-near-me-6e244313be42.herokuapp.com/getVenueReview",
					{
						params: { venueID },
					}
				);
				const { success, review } = response.data;

				if (success && !reviewAdded) {
					setVenueReview(review);

					const counter = {};
					review.forEach((item) => {
						const { reviewRating } = item;
						if (counter.hasOwnProperty(reviewRating)) {
							counter[reviewRating] += 1;
						} else {
							counter[reviewRating] = 1;
						}
					});
					setRatingCounter(counter);
				}
			} catch (error) {
				console.error("Error fetching venue reviews:", error);
			}
		};

		if (popupVisible) {
			fetchVenueMenu();
			fetchVenueReview();
		}
	}, [popupVisible, reviewAdded]);

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

				{/* 1st popup */}
				<Modal visible={popupVisible} transparent animationType="fade">
					<View style={styles.modalContainer}>
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
										<View
											style={{ flexDirection: "row", alignItems: "center" }}
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
													color={
														star <= venueRating ? COLORS.foam : COLORS.grey
													}
													style={{ marginBottom: 9 }}
												/>
											))}
										</View>
										<Button
											title="View Reviews"
											filled
											style={{
												width: "40%",
												borderRadius: 10,
												borderColor: 0,
												elevation: 2,
											}}
											onPress={handlePopUp2}
										/>

										{/* 2nd popup */}
										<Modal
											visible={popupVisible2}
											transparent
											animationType="slide"
										>
											<View style={styles.modalContainer}>
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
													<TouchableOpacity onPress={handlePopUp2}>
														<Ionicons
															name="arrow-back"
															size={24}
															color={COLORS.black}
															style={{ marginTop: 12 }}
														/>
													</TouchableOpacity>
													<ScrollView showsVerticalScrollIndicator={false}>
														<View
															style={{
																justifyContent: "center",
																alignItems: "center",
																marginHorizontal: 22,
																marginTop: 5,
																marginBottom: 12,
															}}
														>
															<Image
																source={{ uri: venueImage }}
																style={styles.venueImage}
															/>
														</View>
														<View
															style={{
																flexDirection: "row",
																alignItems: "center",
															}}
														>
															<View
																style={{
																	flex: 1,
																	marginHorizontal: 12,
																	marginBottom: 12,
																}}
															>
																<Text
																	style={{
																		fontSize: 15,
																		...GlobalStyle.headerFont,
																	}}
																>
																	{venueName}
																</Text>
																<CustomText>{venueAddress}</CustomText>
															</View>
															<Button
																title="Write Reviews"
																filled
																style={{
																	width: "40%",
																	borderRadius: 10,
																	marginBottom: 15,
																	borderColor: 0,
																	elevation: 2,
																}}
																onPress={handlePopUp3}
															/>

															{/* 3rd popup */}
															<Modal
																visible={popupVisible3}
																transparent
																animationType="slide"
															>
																<View style={styles.modalContainer}>
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
																		<View style={{ marginTop: 12 }}>
																			<TouchableOpacity onPress={handlePopUp3}>
																				<Ionicons
																					name="arrow-back"
																					size={24}
																					color={COLORS.black}
																				/>
																			</TouchableOpacity>
																		</View>
																		<View
																			style={{
																				marginHorizontal: 22,
																				flexDirection: "row",
																				justifyContent: "space-between",
																				marginTop: 32,
																			}}
																		></View>
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
																			<View
																				style={{
																					flexDirection: "row",
																					alignItems: "center",
																				}}
																			>
																				<Text
																					style={{
																						flex: 1,
																						fontSize: 15,
																						...GlobalStyle.headerFont,
																					}}
																				>
																					{venueName}
																				</Text>
																				<View
																					style={{
																						flex: 1,
																						alignItems: "flex-end",
																					}}
																				>
																					<AirbnbRating
																						count={5}
																						defaultRating={4}
																						size={18}
																						showRating={false}
																						isDisabled={true}
																					/>
																				</View>
																			</View>
																		</View>
																		<View
																			style={{
																				flexDirection: "column",
																				height: 300,
																				width: "100%",
																				elevation: 2,
																				backgroundColor: COLORS.grey,
																				marginTop: 10,
																				borderRadius: 15,
																				borderColor: 0,
																				marginBottom: 10,
																				paddingHorizontal: 12,
																			}}
																		>
																			<Text
																				style={{
																					fontSize: 15,
																					...GlobalStyle.headerFont,
																					marginTop: 20,
																					marginLeft: 12,
																				}}
																			>
																				Review:
																			</Text>
																			<View
																				style={{
																					flex: 1,
																					borderColor: 0,
																					borderWidth: 1,
																					borderRadius: 12,
																					resizeMode: "contain",
																					paddingLeft: 12,
																					marginTop: 10,
																					backgroundColor: COLORS.grey,
																				}}
																			>
																				<TextInput
																					placeholder="Write your reviews here"
																					style={{ ...GlobalStyle.bodyFont }}
																					value={reviewText}
																					onChangeText={handleReviewTextChange}
																				></TextInput>
																			</View>
																		</View>
																		<View
																			style={{
																				marginBottom: 25,
																				flexDirection: "row",
																				alignItems: "center",
																				justifyContent: "space-between",
																			}}
																		>
																			<Text
																				style={{
																					...GlobalStyle.headerFont,
																					marginLeft: 10,
																				}}
																			>
																				Your rating:
																			</Text>
																			<View
																				style={{
																					flex: 1,
																					alignItems: "flex-end",
																				}}
																			>
																				<AirbnbRating
																					count={5}
																					defaultRating={rating}
																					size={20}
																					showRating={false}
																					onFinishRating={handleRatingChange}
																				/>
																			</View>
																		</View>
																		<Button
																			title="Submit"
																			onPress={handleSubmit}
																			filled
																			style={{
																				elevation: 2,
																				borderColor: 0,
																			}}
																		/>
																	</View>
																</View>
															</Modal>
														</View>
														<View
															style={{
																borderTopColor: "black",
																borderTopWidth: 1,
																marginBottom: 12,
															}}
														></View>
														<View
															style={{
																flex: 1,
																marginHorizontal: 12,
																marginBottom: 12,
															}}
														>
															<CustomText style={{ marginBottom: 12 }}>
																Review Summary
															</CustomText>
															{Object.keys(ratingCounter).length > 0 && (
																<HorizontalBarChart
																	ratingCounter={ratingCounter}
																/>
															)}
														</View>
														<View>
															{venueReview.map((reviews) => (
																<View
																	key={reviews.reviewID}
																	style={{
																		flex: 1,
																		width: "95%",
																		alignSelf: "center",
																		marginTop: 10,
																		borderWidth: 1,
																		borderColor: 0,
																		borderRadius: 10,
																		padding: 10,
																		backgroundColor: COLORS.grey,
																		elevation: 5,
																	}}
																>
																	<CustomText>
																		Posted By: {reviews.reviewUser}
																	</CustomText>
																	<CustomText>
																		Date: {reviews.reviewDate}
																	</CustomText>
																	<CustomText>
																		Review: {reviews.reviewDescription}
																	</CustomText>
																	<CustomText>
																		Ratings: {reviews.reviewRating}
																	</CustomText>
																</View>
															))}
														</View>
													</ScrollView>
												</View>
											</View>
										</Modal>
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
					</View>
				</Modal>
			</View>
		</Animated.View>
	);
};

const BeersVenue = ({ navigation }) => {
	const [sortedVenueData, setSortedVenueData] = useState([]);
	const [sortBy, setSortBy] = useState("dist");
	const [sortOrder, setSortOrder] = useState("asc");
	const [searchInput, setSearchInput] = useState("");
	const [venueData, setVenueData] = useState([]);
	const rotateValue = useRef(new Animated.Value(0)).current;
	const [isDataLoading, setIsDataLoading] = useState(true);
	const { cookies } = useCookies();
	const [isWishlistVisible, setIsWishlistVisible] = useState(false);
	const [WishlistTitle, setWishlistTitle] = useState("");
	const [WishlistMessage, setWishlistMessage] = useState("");
	const [showInstructions, setShowInstructions] = useState(true);

	useEffect(() => {
		const fetchVenueData = async () => {
			try {
				const response = await axios.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getVenueData");
				const { success, venueData } = response.data;
				if (success) {
					let sortedData = [...venueData];
					switch (sortBy) {
						case "name":
							sortedData.sort((a, b) => a.venueName.localeCompare(b.venueName));
							break;
						case "rating":
							sortedData.sort((a, b) => a.venueRating - b.venueRating);
							break;
						default:
							break;
					}
					if (sortOrder === "desc") {
						sortedData.reverse();
					}
					setSortedVenueData(sortedData);
					setVenueData(venueData);
				} else {
					console.error("Error retrieving venue data:", response.data.message);
				}
			} catch (error) {
				console.error("Error retrieving venue data:", error);
			}
		};

		fetchVenueData();
	}, [sortBy, sortOrder]);

	// for animated effect
	useEffect(() => {
		const rotateAnimation = Animated.loop(
			Animated.timing(rotateValue, {
				toValue: 1,
				duration: 1000,
				easing: Easing.linear,
				useNativeDriver: true,
			})
		);

		rotateAnimation.start();

		return () => {
			rotateAnimation.stop();
		};
	}, [rotateValue]);

	const spin = rotateValue.interpolate({
		inputRange: [0, 1],
		outputRange: ["0deg", "360deg"],
	});

	// for sorting and search function
	const handleSortBy = (by) => {
		if (by === sortBy) return;
		setSortBy(by);
	};

	const handleSortOrder = (order) => {
		if (order === sortOrder) return;
		setSortOrder(order);
		let sortedData = [...sortedVenueData];
		if (order === "desc") {
			sortedData.reverse();
		}
		setSortedVenueData(sortedData);
	};

	const handleSearch = (text) => {
		setSearchInput(text);
		const filteredData = venueData.filter((venue) =>
			venue.venueName.toLowerCase().includes(text.toLowerCase())
		);
		setSortedVenueData(filteredData);
		setIsDataLoading(false);
	};

	const handleSlide = (venueID) => {
		console.log("VenueItem with ID", venueID, "was slided.");
		const data = {
			venueID: venueID,
			userID: cookies.userID,
		};
		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/addToWishlist", data)
			.then((response) => {
				if (response.data.success) {
					setWishlistTitle("Success!");
					setWishlistMessage("Added to wishlist!");
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
								Slide the venue and beer names to add to your wishlist!
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
					<View style={styles.grid}>
						<Button
							title="Find a Venue"
							color={COLORS.foam}
							filled
							style={styles.longButton}
							onPress={() => navigation.navigate("BeersVenue")}
						/>
						<Button
							title="Find a Beer"
							color={COLORS.white}
							filled
							style={styles.longButton}
							onPress={() => navigation.navigate("FindABeer")}
						/>
						<Button
							title="Nearby Venues"
							color={COLORS.white}
							filled
							style={styles.longButton}
							onPress={() => navigation.navigate("NearbyVenues")}
						/>
						<Button
							title="Breweries"
							color={COLORS.white}
							filled
							style={styles.longButton}
							onPress={() => navigation.navigate("Breweries")}
						/>
					</View>
					<View style={styles.searchContainer}>
						<TextInput
							placeholder="Search..."
							style={styles.searchInput}
							onChangeText={handleSearch}
							value={searchInput}
						/>
					</View>
					<View style={styles.grid}>
						<Button
							title="Sort by Distance"
							color={COLORS.foam}
							filled={sortBy === "dist"}
							style={styles.shortButton}
							onPress={() => handleSortBy("dist")}
						/>
						<Button
							title="Sort by Name"
							color={COLORS.foam}
							filled={sortBy === "name"}
							style={styles.shortButton}
							onPress={() => handleSortBy("name")}
						/>
						<Button
							title="Sort by Rating"
							color={COLORS.foam}
							filled={sortBy === "rating"}
							style={styles.shortButton}
							onPress={() => handleSortBy("rating")}
						/>
					</View>
					<View style={styles.grid}>
						<Button
							title="Ascending"
							color={COLORS.foam}
							filled={sortOrder === "asc"}
							style={styles.shortButton}
							onPress={() => handleSortOrder("asc")}
						/>
						<Button
							title="Descending"
							color={COLORS.foam}
							filled={sortOrder === "desc"}
							style={styles.shortButton}
							onPress={() => handleSortOrder("desc")}
						/>
					</View>

					<View style={styles.container}>
						{isDataLoading && (
							<Animated.View
								style={[styles.loadingIcon, { transform: [{ rotate: spin }] }]}
							>
								<FontAwesome name="hourglass-1" size={24} color="black" />
							</Animated.View>
						)}
						<ScrollView
							contentContainerStyle={{ paddingBottom: 30 }}
							showsVerticalScrollIndicator={false}
						>
							{sortedVenueData.map((venue) => (
								<VenueItem
									key={venue._id}
									venueID={venue.venueID}
									venueName={venue.venueName}
									venueAddress={venue.venueAddress}
									venueContact={venue.venueContact}
									venueRating={venue.venueRating}
									venueImage={venue.venueImage}
									venueOperatingHours={venue.venueOperatingHours}
									venueFreshness={venue.venueFreshness}
									venueTemperature={venue.venueTemperature}
									onSlide={handleSlide}
								/>
							))}
							<CustomWishlistAlert
								visible={isWishlistVisible}
								onClose={() => setIsWishlistVisible(false)}
								title={WishlistTitle}
								message={WishlistMessage}
							/>
						</ScrollView>
					</View>
				</SafeAreaView>
			</SafeAreaView>
		</View>
	);
};

const styles = StyleSheet.create({
	grid: {
		flexDirection: "row",
		justifyContent: "space-between",
		flexWrap: "wrap",
		marginHorizontal: 20,
	},
	longButton: {
		width: "20%",
		height: 55,
		marginVertical: 0,
		borderRadius: 20,
		marginRight: 0,
		borderColor: 0,
		elevation: 2,
	},
	shortButton: {
		width: "30%",
		height: 40,
		marginVertical: 5,
		borderRadius: 30,
		borderColor: 0,
		elevation: 2,
	},
	button: {
		paddingVertical: 10,
		borderColor: COLORS.black,
		borderWidth: 1,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	searchContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginHorizontal: 20,
		marginVertical: 12,
	},
	searchInput: {
		flex: 1,
		height: 45,
		borderWidth: 1,
		borderColor: 0,
		borderRadius: 20,
		paddingHorizontal: 20,
		marginRight: 10,
		backgroundColor: COLORS.grey,
	},
	container: {
		height: "55%",
		width: "95%",
		alignSelf: "center",
		marginTop: 10,
		borderWidth: 1,
		borderColor: 0,
		borderRadius: 10,
		padding: 10,
		minHeight: 50, // Adjust the height as per your requirement
		backgroundColor: COLORS.grey,
		shadowColor: COLORS.black,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5,
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
		elevation: 5,
		borderColor: 0,
	},
	itemContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
		borderColor: 0,
	},
	modalContainer: {
		flex: 1,
		backgroundColor: COLORS.overlay,
		justifyContent: "center",
		alignItems: "center",
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
	barContainer: {
		marginHorizontal: 2,
		flexDirection: "row",
		marginBottom: 8,
	},
	bar: {
		height: 20,
		backgroundColor: COLORS.foam,
	},
	loadingIcon: {
		justifyContent: "center",
		flex: 1,
		alignSelf: "center",
	},
});

export default BeersVenue;
