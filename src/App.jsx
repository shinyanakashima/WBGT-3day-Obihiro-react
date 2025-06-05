import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { WBGTChart } from "./components/WBGTChart";

function App() {
	return (
		<BrowserRouter basename='/WBGT-3day-Obihiro-react'>
			<Routes>
				<Route path='/:city' element={<ChartPage />} />
			</Routes>
		</BrowserRouter>
	);
}

function ChartPage() {
	const { city } = useParams();
	return <WBGTChart city={city ?? "obihiro"} />;
}

export default App;
