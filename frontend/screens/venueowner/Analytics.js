import { Ionicons, MaterialIcons, Octicons } from "@expo/vector-icons";
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

const CustomText = (props) => {
	return (
		<Text style={{ ...GlobalStyle.bodyFont, ...props.style }}>
			{props.children}
		</Text>
	);
};

const Analytics = ({ navigation }) => {
	const { cookies } = useCookies();

	const [username, setUsername] = useState("");
	const [popularData, setPopularData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [modalVisible1, setModalVisible1] = useState(false);
	const [modalVisible2, setModalVisible2] = useState(false);

	// useEffect(() => {
	// 	const sessionToken = cookies.sessionToken;
	// 	const venueOwnerID = cookies.venueOwnerID;
	// 	setUsername(cookies.username);
	// }, []);

	const data = [30, 40, 25, 50, 45, 20];
	const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

	const maxDataValue = Math.max(...data);
	const scaleY = 150 / maxDataValue;

	// for top 3 most popular beer
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
						<View style={{ flexDirection: "row" }}>
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
						<View style={{ marginHorizontal: 22 }}>
							<Text
								style={{
									fontSize: 18,
									...GlobalStyle.headerFont,
									marginBottom: 12,
								}}
							>
								Analytics Summary
							</Text>

							{/* top 3 popular beers */}
							<View
								style={{
									height: 220,
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
									Top 3 Popular Beers
								</Text>
								<View>
									{isLoading ? (
										<Text>Loading...</Text>
									) : popularData ? (
										<View>
											<Text style={{ ...GlobalStyle.headerFont }}>
												Most Popular Beer:{" "}
												{popularData.mostPopularBeer.beerName}
											</Text>
											<Text
												style={{
													...GlobalStyle.headerFont,
													marginTop: 12,
												}}
											>
												Top 3 Most Popular Beers:
											</Text>
											{popularData.top3MostPopularBeers.map((beer) => (
												<CustomText key={beer.beerID}>
													{beer.beerName}
												</CustomText>
											))}
										</View>
									) : (
										<Text>No most popular beer data found.</Text>
									)}
								</View>
							</View>
						</View>
					</ScrollView>
				</SafeAreaView>
			</SafeAreaView>
		</View>
	);
};

const styles = StyleSheet.create({
	button: {
		paddingVertical: 3, // increased padding
		borderColor: COLORS.black,
		borderWidth: 1,
		borderRadius: 30,
		alignItems: "center",
		justifyContent: "center",
		elevation: 20,
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
	label: {
		marginBottom: 5,
		fontWeight: "bold",
		fontSize: 16,
	},
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 22,
	},
	modalView: {
		margin: 20,
		backgroundColor: "white",
		borderRadius: 20,
		padding: 35,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	buttonOpen: {
		backgroundColor: "#F194FF",
	},
	buttonClose: {
		backgroundColor: COLORS.grey,
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 20,
		borderWidth: 1,
		borderBottomColor: COLORS.black,
		marginTop: 10,
	},
	textStyle: {
		color: COLORS.black,
		fontWeight: "bold",
		textAlign: "center",
	},
	modalText: {
		marginBottom: 15,
		textAlign: "center",
	},
});

export default Analytics;
