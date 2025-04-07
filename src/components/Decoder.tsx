import {
	type FiscalCodeData,
	decodeFiscalCode,
	isValidFiscalCode,
} from "codice-fiscale-ts";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function Decoder() {
	const { t } = useTranslation();
	const [fiscalCode, setFiscalCode] = useState("");
	const [decodedData, setDecodedData] = useState<FiscalCodeData | null>(null);
	const [error, setError] = useState("");

	const handleDecode = async () => {
		setError("");
		setDecodedData(null);

		if (!isValidFiscalCode(fiscalCode)) {
			setError(t("validation.invalidFiscalCode"));
			return;
		}

		try {
			const data = await decodeFiscalCode(fiscalCode);
			setDecodedData(data);
		} catch (err) {
			setError(t("validation.invalidFormat"));
		}
	};

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle>{t("decode.title")}</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="space-y-2">
					<label
						htmlFor="fiscal-code-input"
						className="block text-sm font-medium"
					>
						{t("decode.enter")}
					</label>
					<input
						id="fiscal-code-input"
						value={fiscalCode}
						onChange={(e) => setFiscalCode(e.target.value.toUpperCase())}
						className="w-full px-3 py-2 border border-input bg-background rounded-md uppercase"
						maxLength={16}
					/>
				</div>

				{error && <p className="text-destructive text-sm">{error}</p>}

				<Button type="button" onClick={handleDecode} className="w-full">
					{t("decode.decode")}
				</Button>

				{decodedData && (
					<div className="mt-4 p-4 border rounded-md bg-muted/50 space-y-3">
						<h3 className="font-medium">{t("decode.result.title")}</h3>

						{decodedData.birthDate && (
							<p>
								<span className="font-medium">
									{t("decode.result.birthDate")}:
								</span>{" "}
								{decodedData.birthDate.toLocaleDateString()}
							</p>
						)}

						{decodedData.gender && (
							<p>
								<span className="font-medium">
									{t("decode.result.gender")}:
								</span>{" "}
								{decodedData.gender === "M"
									? t("calculate.male")
									: t("calculate.female")}
							</p>
						)}

						{decodedData.birthPlace && (
							<p>
								<span className="font-medium">
									{t("decode.result.birthPlace")}:
								</span>{" "}
								{decodedData.birthPlace}
							</p>
						)}

						{decodedData.birthProvince && (
							<p>
								<span className="font-medium">
									{t("decode.result.birthProvince")}:
								</span>{" "}
								{decodedData.birthProvince}
							</p>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
