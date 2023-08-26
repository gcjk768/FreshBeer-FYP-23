import {
	Entypo,
	FontAwesome,
	Ionicons,
	MaterialIcons,
	Octicons,
} from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
	Alert,
	Image,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
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
					fontSize: 14,
					textAlign: "center",
					flexWrap: "wrap",
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

// custom alert for adding / editing journal
const CustomJournalAlert = ({ visible, onClose, title, message }) => {
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

const JournalItem = ({
	journalID,
	journalUser,
	journalDate,
	journalBeer,
	journalNotes,
	journalRating,
	journalImage,
	handleJournalEditState,
}) => {
	const [popupVisible, setPopupVisible] = useState(false);
	const [tastingNotes, setTastingNotes] = useState(journalNotes);
	const [tastingNotesRating, setTastingNotesRating] = useState(journalRating);
	const [isJournalVisible, setIsJournalVisible] = useState(false);
	const [JournalTitle, setJournalTitle] = useState("");
	const [JournalMessage, setJournalMessage] = useState("");

	// edit modal
	const handleEdit = () => {
		setPopupVisible(!popupVisible);
	};

	const submitEdit = () => {
		const data = {
			journalID: journalID,
			journalNotes: tastingNotes,
			journalRating: tastingNotesRating,
		};
		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/editJournal", data)
			.then((response) => {
				if (response.data.success) {
					setJournalTitle("Success");
					setJournalMessage("Journal edited!");
					handleJournalEditState();
				} else {
					const { message } = response.data;
					setJournalTitle("Error");
					setJournalMessage(message);
				}
				setIsJournalVisible(true);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	return (
		<View style={{ marginHorizontal: 20 }}>
			<View style={styles.journalContainer}>
				<View style={{ marginHorizontal: 12 }}>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							alignItems: "center",
							backgroundColor: COLORS.grey,
							marginTop: 5,
						}}
					></View>

					<View
						style={{ flexDirection: "row", justifyContent: "space-between" }}
					>
						<Text
							style={{
								...GlobalStyle.headerFont,
								fontSize: 18,
								marginTop: 12,
							}}
						>
							{journalDate}
						</Text>
						<FontAwesome
							name="edit"
							size={24}
							color="black"
							onPress={handleEdit}
						/>
					</View>

					{/* popup for edit journal */}
					<Modal visible={popupVisible} transparent animationType="slide">
						<View
							style={{
								flex: 1,
								backgroundColor: COLORS.overlay,
								justifyContent: "center",
								alignItems: "center",
							}}
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
								<View style={{ marginTop: 12 }}>
									<TouchableOpacity onPress={handleEdit}>
										<Ionicons
											name="arrow-back"
											size={24}
											color={COLORS.black}
										/>
									</TouchableOpacity>
								</View>

								<View
									style={{ alignItems: "center", justifyContent: "center" }}
								>
									<Text style={{ ...GlobalStyle.headerFont, fontSize: 18 }}>
										Edit Journal
									</Text>
									<Image
										source={{ uri: journalImage }}
										style={styles.journalImage}
									/>
									<Text style={{ ...GlobalStyle.headerFont, fontSize: 15 }}>
										Beer name: {journalBeer}
									</Text>

									<View
										style={{
											flexDirection: "column",
											height: 200,
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
											Tasting Notes:
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
												style={{ ...GlobalStyle.bodyFont }}
												value={tastingNotes}
												onChangeText={setTastingNotes}
												multiline
											></TextInput>
										</View>
									</View>
								</View>
								<View style={{ flexDirection: "row", marginBottom: 12 }}>
									<Text
										style={{
											...GlobalStyle.headerFont,
											fontSize: 15,
											marginRight: 12,
											marginTop: 5,
										}}
									>
										Ratings:
									</Text>
									<AirbnbRating
										count={5}
										defaultRating={tastingNotesRating}
										size={18}
										showRating={false}
										onFinishRating={setTastingNotesRating}
									/>
								</View>
								<Button
									title="Submit"
									onPress={submitEdit}
									filled
									style={{
										elevation: 2,
										borderColor: 0,
									}}
								/>
								<CustomJournalAlert
									visible={isJournalVisible}
									onClose={() => setIsJournalVisible(false)}
									title={JournalTitle}
									message={JournalMessage}
								/>
							</View>
						</View>
					</Modal>

					<Image source={{ uri: journalImage }} style={styles.journalImage} />
					<Text style={{ ...GlobalStyle.headerFont, fontSize: 18 }}>
						{journalBeer}
					</Text>
					<CustomText>{journalNotes}</CustomText>
					<View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
						<AirbnbRating
							count={5}
							defaultRating={journalRating}
							size={18}
							showRating={false}
							isDisabled={true}
						/>
					</View>
				</View>
			</View>
		</View>
	);
};

const Journal = ({ navigation }) => {
	const [activeButton, setActiveButton] = useState("journal"); // selected button
	const [tastingNotes, setTastingNotes] = useState("");

	const [tastingNotesRating, setTastingNotesRating] = useState(0);
	const [isJournalVisible, setIsJournalVisible] = useState(false);
	const [JournalTitle, setJournalTitle] = useState("");
	const [JournalMessage, setJournalMessage] = useState("");

	const { cookies } = useCookies();
	const [beerData, setBeerData] = useState([]);
	const [selectedBeer, setSelectedBeer] = useState(null);
	const [journalData, setJournalData] = useState([]);
	const [journalEditState, setJournalEditState] = useState(false);
	const [statisticsData, setStatisticsData] = useState([]);

	const [popupVisible, setPopupVisible] = useState(false);
	const [venueMenu, setVenueMenu] = useState([]);
	const [popupVisible2, setPopupVisible2] = useState(false);
	const [beerLocation, setBeerLocation] = useState([]);

	const handleButton = (title) => {
		setActiveButton(title);
	};

	const handleJournalEditState = () => {
		setJournalEditState(true);
	};

	// for most recently visited modal
	const handlePopup = () => {
		setPopupVisible(!popupVisible);
	};

	const handlePopUp2 = () => {
		setPopupVisible2(!popupVisible2);
	};

	const submitJournal = () => {
		const currentDate = new Date();
		const day = currentDate.getDate();
		const month = currentDate.getMonth() + 1;
		const year = currentDate.getFullYear();
		const formattedDate = `${day}/${month}/${year}`;

		const data = {
			userID: cookies.userID,
			journalDate: formattedDate,
			journalBeer: selectedBeer,
			journalNotes: tastingNotes,
			journalRating: tastingNotesRating,
		};

		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/submitJournal", data)
			.then((response) => {
				if (response.data.success) {
					setJournalTitle("Success");
					setJournalMessage("Journal added!");
					setTastingNotes("");
					setTastingNotesRating(0);
				} else {
					const { message } = response.data;
					setJournalTitle("Error");
					setJournalMessage(message);
				}
				setIsJournalVisible(true);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	useEffect(() => {
		const fetchBeerData = async () => {
			try {
				const response = await axios.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getBeerData");
				const { success, beerData } = response.data;
				if (success) {
					setBeerData(beerData);
				} else {
					console.error("Error retrieving beer data:", response.data.message);
				}
			} catch (error) {
				console.error("Error retrieving beer data:", error);
			}
		};
		fetchBeerData();
	}, []);

	useEffect(() => {
		axios
			.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getJournal", {
				params: {
					userID: cookies.userID,
				},
			})
			.then((response) => {
				setJournalData(response.data);
				setJournalEditState(false);
			})
			.catch((error) => {
				console.error("Error retrieving Journal", error);
			});
	}, [journalEditState]);

	useEffect(() => {
		axios
			.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getStatistics", {
				params: {
					userID: cookies.userID,
				},
			})
			.then((response) => {
				setStatisticsData(response.data);
			})
			.catch((error) => {
				console.error("Error retrieving Statistics", error);
			});
	}, []);

	useEffect(() => {
		const fetchVenueMenu = async () => {
			try {
				const response = await axios.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getVenueMenu", {
					params: { venueID: statisticsData.mostRecentVenue?.venueID },
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

	useEffect(() => {
		const fetchBeerLocations = async () => {
			try {
				const response = await axios.get(
					"https://fresh-beer-near-me-6e244313be42.herokuapp.com/getBeerLocation",
					{
						params: { beerID: statisticsData.mostRecentBeer?.beerID },
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

		if (popupVisible2) {
			fetchBeerLocations();
		}
	}, [popupVisible2]);

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

				<View style={{ marginHorizontal: 20 }}>
					<View style={{ flexDirection: "row", marginVertical: 18 }}>
						{/* for beer journal */}
						<Button
							title="My Beer Journal"
							onPress={() => handleButton("journal")}
							style={
								activeButton === "journal"
									? styles.activeFilterButton
									: styles.filterButton
							}
						/>
						<Button
							title="My Statistics"
							onPress={() => handleButton("statistics")}
							style={
								activeButton === "statistics"
									? styles.activeFilterButton
									: styles.filterButton
							}
						/>
					</View>
				</View>

				{/*  for journals */}
				{activeButton === "journal" ? (
					<View style={{ flex: 1 }}>
						<ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
							{journalData.map((journal) => (
								<JournalItem
									key={journal.journalID}
									journalID={journal.journalID}
									journalUser={journal.journalUser}
									journalDate={journal.journalDate}
									journalBeer={journal.journalBeer}
									journalNotes={journal.journalNotes}
									journalRating={journal.journalRating}
									journalImage={journal.journalImage}
									handleJournalEditState={handleJournalEditState}
								/>
							))}
							<View style={{ marginHorizontal: 20 }}>
								<View
									style={{
										borderBottomWidth: 1,
										borderBottomColor: COLORS.black,
										marginVertical: 10,
									}}
								></View>
								<Text style={{ ...GlobalStyle.headerFont }}>Select Beer:</Text>
								<View
									style={{
										position: "relative",
										zIndex: 1,
										marginVertical: 12,
									}}
								>
									<SelectList
										data={beerData.map((beer) => ({
											label: beer.beerName,
											value: beer.beerName,
										}))}
										value={selectedBeer}
										setSelected={(value) => setSelectedBeer(value)}
										boxStyles={{
											borderRadius: 12,
											borderColor: 0,
											backgroundColor: COLORS.grey,
											opacity: 1,
										}}
										dropdownStyles={{
											right: 0,
											borderColor: 0,
											backgroundColor: COLORS.grey,
											opacity: 1,
										}}
										defaultOption={selectedBeer}
										search={true}
									/>
								</View>

								<View
									style={{
										flexDirection: "column",
										height: 200,
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
										Tasting Notes:
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
											placeholder="Write your notes here"
											style={{ ...GlobalStyle.bodyFont }}
											value={tastingNotes}
											onChangeText={setTastingNotes}
											multiline
										></TextInput>
									</View>
								</View>

								<View style={{ flexDirection: "row", marginBottom: 12 }}>
									<Text
										style={{
											...GlobalStyle.headerFont,
											fontSize: 15,
											marginRight: 12,
											marginTop: 5,
										}}
									>
										Ratings:
									</Text>
									<AirbnbRating
										count={5}
										defaultRating={tastingNotesRating}
										size={18}
										showRating={false}
										onFinishRating={setTastingNotesRating}
									/>
								</View>

								<Button
									title="Add Journal"
									filled
									style={{
										width: "40%",
										borderRadius: 10,
										marginBottom: 15,
										borderColor: 0,
										elevation: 2,
										justifyContent: "flex-end",
									}}
									onPress={submitJournal}
								/>
							</View>
							<CustomJournalAlert
								visible={isJournalVisible}
								onClose={() => setIsJournalVisible(false)}
								title={JournalTitle}
								message={JournalMessage}
							/>
						</ScrollView>
					</View>
				) : (
					// for statistics
					activeButton === "statistics" && (
						<View style={{ flex: 1 }}>
							<ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
								<View style={{ marginHorizontal: 20 }}>
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
										<Text style={{ ...GlobalStyle.headerFont, fontSize: 16 }}>
											Number of unique places checked in
										</Text>
										<CustomText>{statisticsData.numUniqueVenues}</CustomText>

										<Text style={{ ...GlobalStyle.headerFont, fontSize: 16 }}>
											Types of beer tried
										</Text>
										<CustomText>{statisticsData.numUniqueBeers}</CustomText>

										<Text style={{ ...GlobalStyle.headerFont, fontSize: 16 }}>
											Your favorite tasting notes are
										</Text>
										<CustomText>
											{statisticsData.favoriteTastingNote}
										</CustomText>

										<Text style={{ ...GlobalStyle.headerFont, fontSize: 16 }}>
											Your favorite bar is
										</Text>
										<CustomText>
											{statisticsData.favoriteVenueName} (Visited{" "}
											{statisticsData.numberOfTimes} times!)
										</CustomText>
									</View>

									{/* most recently visited  */}
									<TouchableOpacity
										style={styles.journalContainer}
										onPress={handlePopup}
									>
										<View style={{ marginHorizontal: 12 }}>
											<View
												style={{
													flexDirection: "row",
													justifyContent: "space-between",
													alignItems: "center",
													backgroundColor: COLORS.grey,
													marginTop: 5,
												}}
											></View>

											<Text
												style={{
													...GlobalStyle.headerFont,
													fontSize: 18,
													marginTop: 12,
												}}
											>
												Most Recently Visited
											</Text>
											<Image
												source={{
													uri: statisticsData.mostRecentVenue?.venueImage,
												}}
												style={styles.venueImage}
											/>
											<Text style={{ ...GlobalStyle.headerFont, fontSize: 16 }}>
												{statisticsData.mostRecentVenue?.venueName}
											</Text>
											<View
												style={{
													flexDirection: "row",
													justifyContent: "flex-end",
												}}
											>
												<AirbnbRating
													count={5}
													defaultRating={
														statisticsData.mostRecentVenue?.venueRating
													}
													size={18}
													showRating={false}
													isDisabled={true}
												/>
											</View>
										</View>
									</TouchableOpacity>

									{/* popup for most recently visited */}
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
											<ScrollView
												contentContainerStyle={{
													flexGrow: 1,
													paddingBottom: 30,
												}}
												showsVerticalScrollIndicator={false}
											>
												<Image
													source={{
														uri: statisticsData.mostRecentVenue?.venueImage,
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
													{statisticsData.mostRecentVenue?.venueName}
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
																{statisticsData.mostRecentVenue?.venueAddress}
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
																{statisticsData.mostRecentVenue?.venueContact}
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
															{statisticsData.mostRecentVenue?.venueOperatingHours
																.split("\n")
																.map((line, index) => (
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
																		<CustomText
																			style={{ justifyContent: "flex-end" }}
																		>
																			{line.substring(line.indexOf(" ") + 1)}
																		</CustomText>
																	</View>
																))}
														</View>
													</View>
													<CustomText>
														Average Beer Freshness:{" "}
														{statisticsData.mostRecentVenue?.venueFreshness}
													</CustomText>
													<CustomText>
														Average Beer Temperature:{" "}
														{statisticsData.mostRecentVenue?.venueTemperature}
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
																		statisticsData.mostRecentVenue?.venueRating
																			? COLORS.foam
																			: COLORS.grey
																	}
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
														style={{
															fontSize: 16,
															marginTop: 12,
															marginBottom: 12,
														}}
													>
														Menu
													</CustomText>

													<View
														style={{ flexDirection: "row", flexWrap: "wrap" }}
													>
														{statisticsData.mostRecentVenue?.venueMenu.map(
															(beer) => {
																if (beer.beerID === undefined) {
																	return null;
																}
																return (
																	<View
																		key={`${statisticsData.mostRecentVenue?.venueID}-${beer.beerID}`}
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
																		<View
																			style={{
																				marginTop: 12,
																				paddingHorizontal: 10,
																			}}
																		>
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
																);
															}
														)}
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

									{/* most recently tried */}
									<TouchableOpacity
										style={styles.journalContainer}
										onPress={handlePopUp2}
									>
										<View style={{ marginHorizontal: 12 }}>
											<View
												style={{
													flexDirection: "row",
													justifyContent: "space-between",
													alignItems: "center",
													backgroundColor: COLORS.grey,
													marginTop: 5,
												}}
											></View>

											<Text
												style={{
													...GlobalStyle.headerFont,
													fontSize: 18,
													marginTop: 12,
												}}
											>
												Most Recently Tried
											</Text>
											<Image
												source={{
													uri: statisticsData.mostRecentBeer?.beerImage,
												}}
												style={styles.journalImage}
											/>
											<Text style={{ ...GlobalStyle.headerFont, fontSize: 16 }}>
												{statisticsData.mostRecentBeer?.beerName}
											</Text>
											<View
												style={{
													flexDirection: "row",
													justifyContent: "flex-end",
												}}
											>
												<AirbnbRating
													count={5}
													defaultRating={statisticsData.mostRecentBeer?.rating}
													size={18}
													showRating={false}
													isDisabled={true}
												/>
											</View>
										</View>
									</TouchableOpacity>

									{/* popup for most recently tried */}
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
											<ScrollView showsVerticalScrollIndicator={false}>
												<Image
													source={{
														uri: statisticsData.mostRecentBeer?.beerImage,
													}}
													style={styles.journalImage}
												/>
												<CustomText
													style={{
														fontSize: 18,
														textAlign: "center",
													}}
												>
													{statisticsData.mostRecentBeer?.beerName} -- $
													{statisticsData.mostRecentBeer?.price}
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
																color={
																	star <= statisticsData.mostRecentBeer?.rating
																		? COLORS.foam
																		: COLORS.grey
																}
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
														Alcohol%: {statisticsData.mostRecentBeer?.ABV}
													</CustomText>
													<CustomText style={{ marginBottom: 12 }}>
														Bitter Units: {statisticsData.mostRecentBeer?.IBU}
													</CustomText>
												</View>
												<CustomText style={{ fontSize: 17 }}>
													Description
												</CustomText>
												<CustomText>
													{statisticsData.mostRecentBeer?.beerDescription}
												</CustomText>
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
												{statisticsData.mostRecentBeer?.beerLocation.map(
													(location) => {
														if (!location.venueID || !location.beerID) {
															return null;
														}
														return (
															<View
																key={`${location.venueID}-${location.beerID}`}
															>
																<CustomText>{location.venueName}</CustomText>
															</View>
														);
													}
												)}
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
							</ScrollView>
						</View>
					)
				)}
			</SafeAreaView>
		</View>
	);
};

const styles = StyleSheet.create({
	activeFilterButton: {
		width: "50%",
		height: 50,
		marginVertical: 12,
		borderRadius: 20,
		marginRight: 5,
		borderColor: 0,
		elevation: 2,
		backgroundColor: COLORS.foam,
	},
	filterButton: {
		width: "50%",
		height: 50,
		marginVertical: 12,
		borderRadius: 20,
		marginRight: 5,
		borderColor: 0,
		elevation: 2,
		backgroundColor: COLORS.white,
	},
	journalContainer: {
		backgroundColor: COLORS.grey,
		flexDirection: "column",
		width: "100%",
		borderRadius: 26,
		padding: 10,
		borderWidth: 1,
		borderColor: 0,
		marginBottom: 12,
	},
	button: {
		paddingVertical: 10,
		borderColor: COLORS.grey,
		borderWidth: 1,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
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
	journalImage: {
		width: 250,
		height: 230,
		borderRadius: 15,
		marginTop: 20,
		justifyContent: "center",
		marginBottom: 10,
		alignSelf: "center",
	},
});

export default Journal;
