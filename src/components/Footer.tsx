import { Github } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Footer() {
	const { t } = useTranslation();
	const currentYear = new Date().getFullYear();

	return (
		<footer className="w-full py-6 mt-12 border-t bg-card">
			<div className="container mx-auto px-4">
				<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
					<div className="flex items-center space-x-4">
						<a
							href="https://www.bitrey.dev"
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							{t("footer.portfolio") || "Portfolio"}
						</a>
						<a
							href="https://github.com/alessandroamella/codice-fiscale-calculator"
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							<Github size={16} className="inline-block mr-1" />
							GitHub
						</a>
						<a
							href="https://www.npmjs.com/package/codice-fiscale-ts"
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							{t("footer.library") || "Library"}
						</a>
					</div>
					<div className="text-sm text-muted-foreground">
						© {currentYear}{" "}
						{t("footer.copyright") || "Codice Fiscale Calculator"}
					</div>
				</div>
			</div>
		</footer>
	);
}
