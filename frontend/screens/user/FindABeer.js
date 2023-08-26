import {
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
	const [popupVisible, setPopupVisible] = useState(false);
	const [popupVisible2, setPopupVisible2] = useState(false); // created 2nd modal
	const [popupVisible3, setPopupVisible3] = useState(false); // created 3rd modal
	const [beerLocation, setBeerLocation] = useState([]);
	const [beerReview, setBeerReview] = useState([]);
	const [reviewText, setReviewText] = useState("");
	const [reviewRating, setReviewRating] = useState(0);
	const [ratingCounter, setRatingCounter] = useState({});
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
					onSlide(beerID);
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
		setReviewRating(ratingValue);
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
			rating: reviewRating,
			userID: userID,
			reviewDate: formattedDate,
			beerID: beerID,
		};

		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/addBeerReview", data)
			.then((response) => {
				if (response.data.success) {
					console.log("Review Added");

					const newReview = {
						reviewID: generateRandomNumber(),
						reviewUser: cookies.username,
						reviewDate: formattedDate,
						reviewDescription: reviewText,
						reviewRating: reviewRating,
					};

					setBeerReview((prevReviews) => [...prevReviews, newReview]);

					setRatingCounter((prevCounter) => {
						const newCounter = { ...prevCounter };
						if (newCounter.hasOwnProperty(reviewRating)) {
							newCounter[reviewRating] += 1;
						} else {
							newCounter[reviewRating] = 1;
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
		setReviewRating(0);
		handlePopUp3();
	};

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

		const fetchBeerReview = async () => {
			try {
				const response = await axios.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getBeerReview", {
					params: { beerID },
				});
				const { success, review } = response.data;
				if (success && !reviewAdded) {
					setBeerReview(review);
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
				console.error("Error fetching beer review:", error);
			}
		};

		if (popupVisible) {
			fetchBeerLocations();
			fetchBeerReview();
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
								<View
									style={{
										flexDirection: "row",
										justifyContent: "space-between",
										alignItems: "center",
										elevation: 5,
									}}
								>
									<Text
										style={{
											...GlobalStyle.headerFont,
											fontSize: 17,
											marginBottom: 10,
											marginTop: 10,
										}}
									>
										Community Reviews
									</Text>
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
								</View>
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
											<ScrollView
												style={{ marginTop: 12 }}
												showsVerticalScrollIndicator={false}
											>
												<TouchableOpacity onPress={handlePopUp2}>
													<Ionicons
														name="arrow-back"
														size={24}
														color={COLORS.black}
													/>
												</TouchableOpacity>
												<View
													style={{
														justifyContent: "center",
														alignItems: "center",
														marginHorizontal: 32,
														marginTop: 5,
														marginBottom: 12,
													}}
												>
													<Image
														source={{ uri: beerImage }}
														style={styles.beerImage}
													/>
												</View>
												<View
													style={{ flexDirection: "row", alignItems: "center" }}
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
															{beerName}
														</Text>
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
																			{beerName}
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
																			defaultRating={reviewRating}
																			size={18}
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
													<HorizontalBarChart ratingCounter={ratingCounter} />
													<View>
														{beerReview.map((reviews) => (
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
												</View>
											</ScrollView>
										</View>
									</View>
								</Modal>
							</ScrollView>
						</View>
					</View>
				</Modal>
			</View>
		</Animated.View>
	);
};

const FindABeer = ({ navigation }) => {
	const [sortedBeerData, setSortedBeerData] = useState([]);
	const [sortBy, setSortBy] = useState("name");
	const [sortOrder, setSortOrder] = useState("asc");
	const [searchInput, setSearchInput] = useState("");
	const [beerData, setBeerData] = useState([]);
	const rotateValue = useRef(new Animated.Value(0)).current;
	const [isDataLoading, setIsDataLoading] = useState(true);
	const { cookies } = useCookies();
	const [isWishlistVisible, setIsWishlistVisible] = useState(false);
	const [WishlistTitle, setWishlistTitle] = useState("");
	const [WishlistMessage, setWishlistMessage] = useState("");

	useEffect(() => {
		const fetchBeerData = async () => {
			try {
				setIsDataLoading(true);
				const response = await axios.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getBeerData");
				const { success, beerData } = response.data;
				if (success) {
					let sortedData = [...beerData];
					switch (sortBy) {
						case "name":
							sortedData.sort((a, b) => a.beerName.localeCompare(b.beerName));
							break;
						case "price":
							sortedData.sort((a, b) => a.price - b.price);
							break;
						case "rating":
							sortedData.sort((a, b) => a.rating - b.rating);
							break;
						default:
							break;
					}
					if (sortOrder === "desc") {
						sortedData.reverse();
					}
					setSortedBeerData(sortedData);
					setBeerData(beerData);
				} else {
					console.error("Error retrieving beer data:", response.data.message);
				}
			} catch (error) {
				console.error("Error retrieving beer data:", error);
			} finally {
				setIsDataLoading(false);
			}
		};

		fetchBeerData();
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

	const handleSortBy = (by) => {
		if (by === sortBy) return;
		setSortBy(by);
	};

	const handleSortOrder = (order) => {
		if (order === sortOrder) return;
		setSortOrder(order);
		let sortedData = [...sortedBeerData];
		if (order === "desc") {
			sortedData.reverse();
		}
		setSortedBeerData(sortedData);
	};

	const handleSearch = (text) => {
		setSearchInput(text);
		const filteredData = beerData.filter((beer) =>
			beer.beerName.toLowerCase().includes(text.toLowerCase())
		);
		setSortedBeerData(filteredData);
		setIsDataLoading(false);
	};

	const handleSlide = (beerID) => {
		console.log("BeerItem with ID", beerID, "was slided.");
		const data = {
			beerID: beerID,
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
							color={COLORS.white}
							filled
							style={styles.longButton}
							onPress={() => navigation.navigate("BeersVenue")}
						/>
						<Button
							title="Find a Beer"
							color={COLORS.foam}
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
							title="Sort by Name"
							color={COLORS.foam}
							filled={sortBy === "name"}
							style={styles.shortButton}
							onPress={() => handleSortBy("name")}
						/>
						<Button
							title="Sort by Price"
							color={COLORS.foam}
							filled={sortBy === "price"}
							style={styles.shortButton}
							onPress={() => handleSortBy("price")}
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
							{sortedBeerData.map((beer) => (
								<BeerItem
									key={beer._id}
									beerID={beer.beerID}
									beerName={beer.beerName}
									price={beer.price}
									rating={beer.rating}
									beerDescription={beer.beerDescription}
									beerImage={beer.beerImage}
									ABV={beer.abv}
									IBU={beer.ibu}
									communityReviews={beer.communityReviews}
									venueAvailability={beer.venueAvailability}
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
		borderColor: 0,
		marginRight: 0,
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
		elevation: 5, // Add elevation for Android
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
	popup: {
		width: "90%", // Adjust the width of the popup
		height: 500, // Adjust the height of the popup
		backgroundColor: COLORS.white,
		borderRadius: 10,
		padding: 20,
		elevation: 5,
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
	barContainer: {
		marginHorizontal: 2,
		flexDirection: "row",
		marginBottom: 8,
	},
	bar: {
		height: 20,
		backgroundColor: COLORS.foam, // Set the desired color for the bars
	},
	loadingIcon: {
		justifyContent: "center",
		flex: 1,
		alignSelf: "center",
	},
});

export default FindABeer;
