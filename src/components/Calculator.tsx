import { useQuery } from "@tanstack/react-query";
import {
	type Person,
	calculateFiscalCode,
	getForeignCountries,
	getMunicipalities,
} from "codice-fiscale-ts";
import Cookies from "js-cookie";
import { Check, Copy } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";
import VirtualizedSelect from "./ui/virtualized-select";

type FormData = {
	firstName: string;
	lastName: string;
	birthDate: string;
	gender: "M" | "F";
	birthPlace?: string;
	country: string;
};

type OptionType = {
	value: string;
	label: string;
};

const COOKIE_KEY = "codice_fiscale_form_data";
const COOKIE_EXPIRY = 30; // days

export function Calculator() {
	const { t, i18n } = useTranslation();
	const [fiscalCode, setFiscalCode] = useState<string>("");
	const [copied, setCopied] = useState(false);

	const { register, handleSubmit, control, watch, reset } = useForm<FormData>({
		defaultValues: {
			country: "IT", // Default to Italy
		},
	});

	const formValues = watch();

	const getSavedData = useCallback(() => {
		const savedData = Cookies.get(COOKIE_KEY);
		if (savedData) {
			return JSON.parse(savedData) as FormData;
		}
	}, []);

	// Load saved form data from cookies on initial render
	useEffect(() => {
		try {
			const parsedData = getSavedData();
			reset(parsedData);
		} catch (err) {
			console.error("Error parsing saved form data:", err);
		}
	}, [getSavedData, reset]);

	// Save form data automatically when it changes
	useEffect(() => {
		const saveData = () => {
			Cookies.set(COOKIE_KEY, JSON.stringify(formValues), {
				expires: COOKIE_EXPIRY,
			});
		};

		// Only save if we have at least one field with data
		if (Object.values(formValues).some((value) => value)) {
			saveData();
		}
	}, [formValues]);

	const country = watch("country");
	const isItaly = useMemo(() => country === "IT", [country]);

	const { data: municipalities, isLoading: loadingMunicipalities } = useQuery({
		queryKey: ["municipalities"],
		queryFn: getMunicipalities,
		staleTime: Number.POSITIVE_INFINITY,
	});

	const { data: countries, isLoading: loadingCountries } = useQuery({
		queryKey: ["countries"],
		queryFn: getForeignCountries,
		staleTime: Number.POSITIVE_INFINITY,
	});

	const municipalityOptions = useMemo(
		() =>
			municipalities?.map((m) => ({
				value: m[0],
				label: `${m[1]} (${m[2]})`,
			})) || [],
		[municipalities],
	);

	const countryOptions = useMemo(
		() =>
			(countries && [["", "IT"], ...countries])?.map(([, alpha2]) => ({
				value: alpha2,
				label:
					new Intl.DisplayNames([i18n.language], { type: "region" }).of(
						alpha2,
					) || alpha2,
			})) || [],
		[countries, i18n.language],
	);

	const onSubmit = useCallback(async (data: FormData) => {
		const person: Person = {
			firstName: data.firstName,
			lastName: data.lastName,
			birthDate: new Date(data.birthDate),
			gender: data.gender,
			...(data.country === "IT"
				? { birthPlace: data.birthPlace! }
				: { foreignCountry: data.country }),
		};

		try {
			const code = await calculateFiscalCode(person);
			setFiscalCode(code);
		} catch (error) {
			console.error("Error calculating fiscal code:", error);
		}
	}, []);

	const copyToClipboard = useCallback(() => {
		navigator.clipboard.writeText(fiscalCode);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [fiscalCode]);

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle>{t("calculate.title")}</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label htmlFor="firstName" className="block text-sm font-medium">
								{t("calculate.firstName")}
							</label>
							<input
								id="firstName"
								{...register("firstName", { required: true })}
								className="w-full px-3 py-2 border border-input bg-background rounded-md"
								autoComplete="given-name"
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="lastName" className="block text-sm font-medium">
								{t("calculate.lastName")}
							</label>
							<input
								id="lastName"
								{...register("lastName", { required: true })}
								className="w-full px-3 py-2 border border-input bg-background rounded-md"
								autoComplete="family-name"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label htmlFor="birthDate" className="block text-sm font-medium">
								{t("calculate.birthDate")}
							</label>
							<input
								id="birthDate"
								type="date"
								{...register("birthDate", { required: true })}
								className="w-full px-3 py-2 border border-input bg-background rounded-md"
								autoComplete="bday"
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="gender" className="block text-sm font-medium">
								{t("calculate.gender")}
							</label>
							<select
								id="gender"
								{...register("gender", { required: true })}
								className="w-full px-3 py-2 border border-input bg-background rounded-md"
								autoComplete="sex"
							>
								<option value="M">{t("calculate.male")}</option>
								<option value="F">{t("calculate.female")}</option>
							</select>
						</div>
					</div>

					{countryOptions.length > 0 && (
						<div className="space-y-2">
							<label htmlFor="country" className="block text-sm font-medium">
								{t("calculate.birthCountry")}
							</label>
							<Controller
								name="country"
								control={control}
								rules={{ required: true }}
								render={({ field }) => {
									const selectedCountryOption = useMemo(
										() =>
											countryOptions.find(
												(option) => option.value === field.value,
											) || null,
										[field.value],
									);

									const handleCountryChange = useCallback(
										(option: OptionType | null) =>
											field.onChange(option ? option.value : "IT"),
										[field],
									);

									return (
										<VirtualizedSelect
											defaultValue={{
												value: "IT",
												label: "Italy",
											}}
											inputId="country"
											options={countryOptions}
											placeholder={t("calculate.searchPlaceholder")}
											isSearchable
											isLoading={loadingCountries}
											value={selectedCountryOption}
											onChange={handleCountryChange}
										/>
									);
								}}
							/>
						</div>
					)}

					{isItaly && (
						<div className="space-y-2">
							<label htmlFor="birthPlace" className="block text-sm font-medium">
								{t("calculate.birthPlace")}
							</label>
							<Controller
								name="birthPlace"
								control={control}
								rules={{ required: isItaly }}
								render={({ field }) => {
									const selectedMunicipalityOption = useMemo(
										() =>
											municipalityOptions.find(
												(option) => option.value === field.value,
											) || null,
										[field.value],
									);

									const handleMunicipalityChange = useCallback(
										(option: OptionType | null) =>
											field.onChange(option ? option.value : null),
										[field],
									);

									return (
										<VirtualizedSelect
											inputId="birthPlace"
											options={municipalityOptions}
											placeholder={t("calculate.searchPlaceholder")}
											isSearchable
											isLoading={loadingMunicipalities}
											value={selectedMunicipalityOption}
											onChange={handleMunicipalityChange}
										/>
									);
								}}
							/>
						</div>
					)}

					<Button type="submit" className="w-full">
						{t("calculate.calculate")}
					</Button>
				</form>
			</CardContent>

			{fiscalCode && (
				<CardFooter className="flex flex-col items-start border-t p-4">
					<div className="flex w-full items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-muted-foreground">
								{t("calculate.result")}
							</h3>
							<p className="text-2xl font-mono mt-1">{fiscalCode}</p>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={copyToClipboard}
							title={t("calculate.copy")}
						>
							{copied ? (
								<Check className="h-4 w-4" />
							) : (
								<Copy className="h-4 w-4" />
							)}
						</Button>
					</div>
				</CardFooter>
			)}
		</Card>
	);
}
