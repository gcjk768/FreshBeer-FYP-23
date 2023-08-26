import {
	FontAwesome5,
	Ionicons,
	MaterialIcons,
	Octicons,
} from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
	Alert,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { Header } from "react-native-elements";
import {
	Cell,
	Col,
	Cols,
	Row,
	Rows,
	Table,
	TableWrapper,
} from "react-native-reanimated-table";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCookies } from "../../CookieContext";
import COLORS from "../../constants/colors";
import GlobalStyle from "../../utils/GlobalStyle";

const Button = (props) => {
	const filledBgColor = props.color || COLORS.primary;
	const outlinedColor = COLORS.white;
	const bgColor = props.filled ? filledBgColor : outlinedColor;
	const textColor = props.filled ? COLORS.black : COLORS.white;

	return (
		<TouchableOpacity
			style={{
				...styles.button,
				...{ backgroundColor: bgColor },
				...props.style,
			}}
			onPress={props.onPress}
		>
			<Text style={{ fontSize: 12, ...GlobalStyle.bodyFont, color: textColor }}>
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

const ReportedBugs = ({ navigation }) => {
	const { cookies } = useCookies();
	const [bugData, setBugData] = useState([]);
	const [modalVisibilities, setModalVisibilities] = useState([]);
	const [useEffectRefresh, setUseEffectRefresh] = useState(false);

	const toggleModal = (index) => {
		const newVisibilities = [...modalVisibilities];
		newVisibilities[index] = !newVisibilities[index];
		setModalVisibilities(newVisibilities);
	};

	useEffect(() => {
		axios
			.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getBugs")
			.then((response) => {
				setBugData(response.data);
				setModalVisibilities(Array(response.data.length).fill(false));
				setUseEffectRefresh(false);
			})
			.catch((error) => {
				console.error("Error retrieving Bugs", error);
			});
	}, [useEffectRefresh]);

	const handleResolve = (issueID) => {
		const data = {
			issueID: issueID,
		};

		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/resolveBugs", data)
			.then((response) => {
				if (response.data.success) {
					Alert.alert("Successfully resolved bugs!");
					setUseEffectRefresh(true);
				} else {
					const { message } = response.data;
					Alert.alert("Error!", message);
				}
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
					<ScrollView>
						<View style={{ marginHorizontal: 22 }}>
							<Text
								style={{
									fontSize: 16,
									...GlobalStyle.headerFont,
									marginTop: 10,
								}}
							>
								New bug reports: 3
							</Text>
							<View style={{ marginTop: 20, justifyContent: "center" }}>
								<Table
									borderStyle={{ borderWidth: 1, borderColor: COLORS.black }}
								>
									<Row
										data={["Issue ID", "Description", "Status"]}
										style={styles.head}
										textStyle={{
											textAlign: "center",
											...GlobalStyle.headerFont,
										}}
									/>
									<Rows
										data={bugData.map((bug, index) => [
											bug.issueID,
											bug.issueDescription,
											bug.issueStatus ? (
												"Resolved"
											) : (
												<Button
													title="Update status"
													onPress={() => toggleModal(index)}
													color={COLORS.blue}
													filled
													style={{
														marginTop: 10,
														marginBottom: 4,
														elevation: 2,
													}}
												/>
											),
										])}
										textStyle={{ ...GlobalStyle.bodyFont, textAlign: "center" }}
									/>

									{modalVisibilities.map((isVisible, index) => (
										<Modal
											key={index}
											visible={isVisible}
											animationType="fade"
											transparent
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
													<TouchableOpacity onPress={() => toggleModal(index)}>
														<Ionicons
															name="arrow-back"
															size={24}
															color={COLORS.black}
														/>
													</TouchableOpacity>
												</View>
												<View style={{ marginTop: 20 }}>
													<CustomText>
														Case Number: {bugData[index].issueID}
													</CustomText>
													<CustomText>
														Date Reported: {bugData[index].issueDate}
													</CustomText>
													<CustomText>
														Reported by: {bugData[index].issueUser}
													</CustomText>
													<CustomText>
														Description: {bugData[index].issueDescription}
													</CustomText>
													<CustomText>
														Status:{" "}
														{bugData[index].issueStatus
															? "Resolved"
															: "Pending"}
													</CustomText>
												</View>
												<View
													style={{
														flexDirection: "row",
														justifyContent: "flex-end",
													}}
												>
													<Button
														title="Mark as Resolved"
														filled
														style={{
															width: "40%",
															height: 50,
															borderRadius: 10,
															marginLeft: 10,
														}}
														onPress={() =>
															handleResolve(bugData[index].issueID)
														}
													/>
												</View>
											</View>
										</Modal>
									))}
								</Table>
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
		paddingVertical: 10,
		borderColor: COLORS.black,
		borderWidth: 0,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	head: {
		height: 44,
		backgroundColor: COLORS.foam,
	},
});

export default ReportedBugs;
