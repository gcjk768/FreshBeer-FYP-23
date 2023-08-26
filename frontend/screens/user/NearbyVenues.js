import {
	FontAwesome,
	FontAwesome5,
	Ionicons,
	MaterialIcons,
	Octicons,
} from "@expo/vector-icons";
import axios from "axios";
import * as Location from "expo-location";
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
import MapView, { Callout, Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
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

const NearbyVenues = ({ navigation }) => {
	const [currentLocation, setCurrentLocation] = useState(null);
	const [errorMsg, setErrorMsg] = useState(null);
	const [isMapReady, setIsMapReady] = useState(false);
	const rotateValue = useRef(new Animated.Value(0)).current;
	const [modalVisible, setModalVisible] = useState(false); // 1st modal
	const [selectedMarker, setSelectedMarker] = useState(null);
	const [modalVisible2, setModalVisible2] = useState(false); // 2nd modal
	const [activeFilter, setActiveFilter] = useState(""); // filter button
	const [venueData, setVenueData] = useState([]);
	const [breweryData, setBreweryData] = useState([]);

	// for filtering options
	const handleFilter = (filter) => {
		setActiveFilter(filter);
	};

	// marker for venues
	const MarkerVenueDetails = () => {
		if (!selectedMarker) {
			return null;
		}

		const handleModal = () => {
			setModalVisible(!modalVisible);
		};

		const { venueName, venueAddress, venueImage } = selectedMarker;

		return (
			<Modal visible={modalVisible} transparent animationType="slide">
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Image
							style={{
								width: "100%",
								height: 200,
								resizeMode: "contain",
								marginBottom: 10,
							}}
							source={{ uri: venueImage }}
						/>
						<CustomText style={{ marginBottom: 10 }}>
							Venue Name: {venueName}
						</CustomText>
						<CustomText style={{ marginBottom: 10 }}>
							Address : {venueAddress}
						</CustomText>
						<Button
							title="Close"
							onPress={handleModal}
							filled
							style={{
								elevation: 2,
								borderColor: 0,
							}}
						/>
					</View>
				</View>
			</Modal>
		);
	};

	// marker for breweries
	const MarkerBreweriesDetails = () => {
		if (!selectedMarker) {
			return null;
		}

		const handleModal2 = () => {
			setModalVisible2(!modalVisible2);
		};

		const { breweryName, breweryAddress, breweryImage } = selectedMarker;

		return (
			<Modal visible={modalVisible2} transparent animationType="slide">
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Image
							style={{
								width: "100%",
								height: 200,
								resizeMode: "contain",
								marginBottom: 10,
							}}
							source={{ uri: breweryImage }}
						/>
						<CustomText style={{ marginBottom: 10 }}>
							Venue Name: {breweryName}
						</CustomText>
						<CustomText style={{ marginBottom: 10 }}>
							Address : {breweryAddress}
						</CustomText>
						<Button
							title="Close"
							onPress={handleModal2}
							filled
							style={{
								elevation: 2,
								borderColor: 0,
							}}
						/>
					</View>
				</View>
			</Modal>
		);
	};

	useEffect(() => {
		const fetchLocation = async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				setErrorMsg("Permission to access location was denied");
				return;
			}

			let location = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.Highest,
				maximumAge: 10000,
			});
			setCurrentLocation(location);
			setTimeout(() => {
				setIsMapReady(true);
			}, 1000);
		};
		fetchLocation();
	}, []);

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

	useEffect(() => {
		axios
			.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getVenueCoordinates")
			.then((response) => {
				setVenueData(response.data.venues);
			})
			.catch((error) => {
				console.error("Error retrieving venues:", error);
			});
	}, []);

	useEffect(() => {
		axios
			.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getBreweryCoordinates")
			.then((response) => {
				setBreweryData(response.data.breweries);
			})
			.catch((error) => {
				console.error("Error retrieving breweries:", error);
			});
	}, []);

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
							color={COLORS.foam}
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

					<View style={{ flexDirection: "row", marginHorizontal: 22 }}>
						<Button
							title="Venues"
							onPress={() => handleFilter("venues")}
							style={
								activeFilter === "venues"
									? styles.activeFilterButton
									: styles.filterButton
							}
						/>
						<Button
							title="Breweries"
							onPress={() => handleFilter("breweries")}
							style={
								activeFilter === "breweries"
									? styles.activeFilterButton
									: styles.filterButton
							}
						/>
					</View>

					<View style={styles.container}>
						{isMapReady && currentLocation ? (
							<MapView
								style={styles.map}
								initialRegion={{
									latitude: currentLocation.coords.latitude,
									longitude: currentLocation.coords.longitude,
									latitudeDelta: 0.01,
									longitudeDelta: 0.01,
								}}
							>
								<Marker
									coordinate={{
										latitude: currentLocation.coords.latitude,
										longitude: currentLocation.coords.longitude,
									}}
									title="My Location"
									description="Current location"
								/>
								{/* for venues */}
								{(activeFilter === "venues" || activeFilter === "") &&
									venueData.map((marker) => (
										<Marker
											onPress={() => {
												setModalVisible(true);
												setSelectedMarker(marker);
											}}
											key={marker.venueID}
											coordinate={{
												latitude: marker.venueLatitude,
												longitude: marker.venueLongitude,
											}}
										>
											<Ionicons name="location" size={34} color="#AF7FE2" />
											<Callout>
												<View>
													<View style={styles.bubble}>
														<FontAwesome5
															name="warehouse"
															size={20}
															color="black"
														/>
														<View
															style={{
																flexDirection: "row",
																alignItems: "center",
															}}
														>
															<CustomText>{marker.venueName}</CustomText>
														</View>
													</View>
													<View style={styles.arrowBorder} />
													<View style={styles.arrow} />
												</View>
											</Callout>
										</Marker>
									))}

								{/* for breweries */}
								{(activeFilter === "breweries" || activeFilter === "") &&
									breweryData.map((marker) => (
										<Marker
											onPress={() => {
												setModalVisible2(true);
												setSelectedMarker(marker);
											}}
											key={marker.breweryID}
											coordinate={{
												latitude: marker.breweryLatitude,
												longitude: marker.breweryLongitude,
											}}
										>
											<Ionicons name="location" size={34} color="#11DAF6" />
											<Callout>
												<View>
													<View style={styles.bubble}>
														<FontAwesome5
															name="warehouse"
															size={20}
															color="black"
														/>
														<View
															style={{
																flexDirection: "row",
																alignItems: "center",
															}}
														>
															<CustomText>{marker.breweryName}</CustomText>
														</View>
													</View>
													<View style={styles.arrowBorder} />
													<View style={styles.arrow} />
												</View>
											</Callout>
										</Marker>
									))}
							</MapView>
						) : (
							<Animated.View
								style={[styles.loadingIcon, { transform: [{ rotate: spin }] }]}
							>
								<FontAwesome name="hourglass-1" size={24} color="black" />
							</Animated.View>
						)}
						<MarkerVenueDetails />
						<MarkerBreweriesDetails />
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
	button: {
		paddingVertical: 10,
		borderColor: COLORS.black,
		borderWidth: 1,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	container: {
		height: "65%",
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
	map: {
		width: "100%",
		height: "100%",
	},
	loadingIcon: {
		justifyContent: "center",
		alignItems: "center",
		flex: 1,
	},
	bubble: {
		flexDirection: "column",
		//	alignSelf: "flex-start",
		backgroundColor: "#FFF",
		borderRadius: 6,
		borderColor: 0,
		borderWidth: 5,
		paddingHorizontal: 15,
		padding: 10,
		width: 150,
		flexWrap: "wrap",
	},
	arrow: {
		backgroundColor: "transparent",
		borderColor: "transparent",
		borderTopColor: "#fff",
		borderWidth: 16,
		alignSelf: "center",
		marginTop: -32,
	},
	arrowBorder: {
		backgroundColor: "transparent",
		borderColor: "transparent",
		borderTopColor: "#007a87",
		borderWidth: 16,
		alignSelf: "center",
		marginTop: -0.5,
	},
	modalContainer: {
		flex: 1,
		backgroundColor: COLORS.overlay,
		justifyContent: "flex-end",
		alignItems: "center",
	},
	modalContent: {
		backgroundColor: COLORS.secondary,
		width: "100%",
		padding: 20,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
	},
	activeFilterButton: {
		width: "50%",
		height: 40,
		marginVertical: 12,
		borderRadius: 20,
		marginRight: 0,
		borderColor: 0,
		elevation: 2,
		backgroundColor: COLORS.foam,
	},
	filterButton: {
		width: "50%",
		height: 40,
		marginVertical: 12,
		borderRadius: 20,
		marginRight: 0,
		borderColor: 0,
		elevation: 2,
		backgroundColor: COLORS.white,
	},
});

export default NearbyVenues;
