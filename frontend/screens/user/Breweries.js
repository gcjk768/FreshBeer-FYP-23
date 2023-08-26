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
	Animated,
	Easing,
	Image,
	Modal,
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

// for popup
const BreweryItem = ({
	breweryName,
	breweryRating,
	breweryImage,
	breweryAddress,
	breweryContact,
	breweryOperatingHours,
}) => {
	const [popupVisible, setPopupVisible] = useState(false);

	const handlePopup = () => {
		setPopupVisible(!popupVisible);
	};

	return (
		<View style={styles.subContainer}>
			<TouchableOpacity style={styles.itemContainer} onPress={handlePopup}>
				<View style={{ flex: 1, paddingHorizontal: 6, paddingTop: 6 }}>
					<CustomText>{breweryName}</CustomText>
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
							color={star <= breweryRating ? COLORS.foam : COLORS.grey}
						/>
					))}
				</View>
			</TouchableOpacity>

			{/* popup */}
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
							<Image
								source={{ uri: breweryImage }}
								style={styles.breweryImage}
							/>
							<CustomText
								style={{
									fontSize: 18,
									textAlign: "center",
									marginBottom: 12,
								}}
							>
								{breweryName}
							</CustomText>
							<View style={{ marginHorizontal: 12 }}>
								<View
									style={{
										flexDirection: "row",
										justifyContent: "space-between",
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
											{breweryAddress}
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
											{breweryContact}
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
										Operating Hours
									</CustomText>
									<View>
										{breweryOperatingHours.split("\n").map((line, index) => (
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
						</ScrollView>
					</View>
				</View>
			</Modal>
		</View>
	);
};

const Breweries = ({ navigation }) => {
	const [sortedBreweryData, setSortedBreweryData] = useState([]);
	const [sortBy, setSortBy] = useState("dist");
	const [sortOrder, setSortOrder] = useState("asc");
	const [searchInput, setSearchInput] = useState("");
	const [breweryData, setBreweryData] = useState([]);
	const rotateValue = useRef(new Animated.Value(0)).current;
	const [isDataLoading, setIsDataLoading] = useState(true);

	useEffect(() => {
		const fetchBreweryData = async () => {
			try {
				const response = await axios.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getBreweryData");
				const { success, breweryData } = response.data;
				if (success) {
					let sortedData = [...breweryData];
					switch (sortBy) {
						case "name":
							sortedData.sort((a, b) =>
								a.breweryName.localeCompare(b.breweryName)
							);
							break;
						case "rating":
							sortedData.sort((a, b) => a.breweryRating - b.breweryRating);
							break;
						default:
							break;
					}
					if (sortOrder === "desc") {
						sortedData.reverse();
					}
					setSortedBreweryData(sortedData);
					setBreweryData(breweryData);
				} else {
					console.error(
						"Error retrieving brewery data:",
						response.data.message
					);
				}
			} catch (error) {
				console.error("Error retrieving brewery data:", error);
			}
		};

		fetchBreweryData();
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
		let sortedData = [...sortedBreweryData];
		if (order === "desc") {
			sortedData.reverse();
		}
		setSortedBreweryData(sortedData);
	};

	const handleSearch = (text) => {
		setSearchInput(text);
		const filteredData = breweryData.filter((brewery) =>
			brewery.breweryName.toLowerCase().includes(text.toLowerCase())
		);
		setSortedBreweryData(filteredData);
		setIsDataLoading(false);
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
							color={COLORS.foam}
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
							{sortedBreweryData.map((brewery) => (
								<BreweryItem
									key={brewery._id}
									breweryID={brewery.breweryID}
									breweryName={brewery.breweryName}
									breweryAddress={brewery.breweryAddress}
									breweryContact={brewery.breweryContact}
									breweryRating={brewery.breweryRating}
									breweryImage={brewery.breweryImage}
									breweryOperatingHours={brewery.breweryOperatingHours}
								/>
							))}
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
	popup: {
		width: "90%", // Adjust the width of the popup
		height: 500, // Adjust the height of the popup
		backgroundColor: COLORS.white,
		borderRadius: 10,
		padding: 20,
		elevation: 5,
	},
	breweryImage: {
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
	loadingIcon: {
		justifyContent: "center",
		flex: 1,
		alignSelf: "center",
	},
});

export default Breweries;
