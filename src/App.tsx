import { Calculator as CalculatorIcon, Languages, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calculator } from "./components/Calculator";
import { Decoder } from "./components/Decoder";
import { Footer } from "./components/Footer";
import { ThemeToggle } from "./components/ThemeToggle";
import "./i18n";

function App() {
	const { t, i18n } = useTranslation();
	const [activeTab, setActiveTab] = useState<"calculate" | "decode">(
		"calculate",
	);

	const toggleLanguage = () => {
		i18n.changeLanguage(i18n.language === "en" ? "it" : "en");
	};

	return (
		<div className="flex flex-col min-h-screen bg-background">
			<main className="flex-1">
				<div className="container mx-auto px-4 py-8">
					<div className="flex justify-between items-center mb-8">
						<div>
							<h1 className="text-3xl font-bold text-foreground">
								{t("title")}
							</h1>
							<p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
						</div>
						<div className="flex items-center space-x-2">
							<button
								type="button"
								onClick={toggleLanguage}
								className="p-2 rounded-full hover:bg-accent transition-colors"
								title="Toggle language"
							>
								<Languages size={24} />
							</button>
							<ThemeToggle />
						</div>
					</div>

					<div className="mb-6">
						<div className="border-b border-border">
							<nav className="-mb-px flex space-x-8">
								<button
									type="button"
									onClick={() => setActiveTab("calculate")}
									className={`
										flex items-center px-1 py-4 border-b-2 text-sm font-medium
										${
											activeTab === "calculate"
												? "border-primary text-primary"
												: "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
										}
									`}
								>
									<CalculatorIcon className="mr-2 h-5 w-5" />
									{t("calculate.title")}
								</button>
								<button
									type="button"
									onClick={() => setActiveTab("decode")}
									className={`
										flex items-center px-1 py-4 border-b-2 text-sm font-medium
										${
											activeTab === "decode"
												? "border-primary text-primary"
												: "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
										}
									`}
								>
									<Search className="mr-2 h-5 w-5" />
									{t("decode.title")}
								</button>
							</nav>
						</div>
					</div>

					<div className="mt-6">
						{activeTab === "calculate" ? <Calculator /> : <Decoder />}
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}

export default App;
