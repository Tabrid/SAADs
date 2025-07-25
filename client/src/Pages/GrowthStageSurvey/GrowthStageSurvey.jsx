import { useState, useEffect } from "react";
import { FaBars, FaEdit, FaTrash } from "react-icons/fa";
import { ChevronsUpDown } from "lucide-react";
import { MdMyLocation } from "react-icons/md";
import { IoIosAdd } from "react-icons/io";
import { Parser } from "@json2csv/plainjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from '/logo.png';

const Modal = ({ isOpen, onClose, onSave, initialData, isEdit }) => {
    const [formData, setFormData] = useState(
        initialData || {
            year: '',
            lat: '',
            lan: '',
            season: '',
            dateSurvey: '',
            datePlanting: '',
            ageSeedling: '',
            growthDuration: '',
            surveySite: '',
            fieldArea: '',
            variety: '',
            growthStage: '',
            temperature: '',
            rainfall: '',
            relativeHumidity: '',
            vegetativePhases: {
                "Early Tillering": "",
                "Mid Tillering": "",
                "Max Tillering": ""
            },
            reproductivePhases: {},
            maturity: ""
        }
    );
    const [errors, setErrors] = useState({});
    const [gpsError, setGpsError] = useState('');
    const [isGpsLoading, setIsGpsLoading] = useState(false);
    const [isImageUploading, setIsImageUploading] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleVegetativePhaseChange = (phase, value) => {
        setFormData((prev) => ({
            ...prev,
            vegetativePhases: {
                ...prev.vegetativePhases,
                [phase]: value
            }
        }));
    };
    const vegetativePhases = [
        "Early Tillering",
        "Mid Tillering",
        "Max Tillering"
    ];
    const reproductivePhases = [
        "PI", "Booting", "Flowering Initiation", "Complete flowering", "Heading", "Milk stage", "Soft dough", "Hard dough"
    ];

    useEffect(() => {
        if (formData.datePlanting && formData.growthDuration && formData.ageSeedling) {
            const plantingDate = new Date(formData.datePlanting);
            const growthDuration = parseInt(formData.growthDuration, 10) || 0;
            const ageSeedling = parseInt(formData.ageSeedling, 10) || 0;
            const daysToAdd = growthDuration - ageSeedling;

            if (!isNaN(plantingDate) && daysToAdd >= 0) {
                const maturityDate = new Date(plantingDate);
                maturityDate.setDate(plantingDate.getDate() + daysToAdd);
                const formattedMaturityDate = maturityDate.toISOString().split('T')[0];
                setFormData((prev) => ({
                    ...prev,
                    maturity: formattedMaturityDate
                }));
            } else {
                setFormData((prev) => ({
                    ...prev,
                    maturity: ''
                }));
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                maturity: ''
            }));
        }
    }, [formData.datePlanting, formData.growthDuration, formData.ageSeedling]);

    useEffect(() => {
        if (formData.datePlanting && formData.growthDuration && formData.ageSeedling) {
            const plantingDate = new Date(formData.datePlanting);
            const growthDuration = parseInt(formData.growthDuration, 10) || 0;
            const ageSeedling = parseInt(formData.ageSeedling, 10) || 0;
            const daysToAdd = growthDuration - ageSeedling;
            if (!isNaN(plantingDate)) {
                const maturityDate = new Date(plantingDate);
                maturityDate.setDate(plantingDate.getDate() + daysToAdd);
                const formattedMaturityDate = maturityDate.toISOString().split('T')[0];
                // Calculate Early Tillering (Planting Date + 7 days)
                const earlyTilleringDate = new Date(plantingDate);
                earlyTilleringDate.setDate(plantingDate.getDate() +15);
                const formattedEarlyTilleringDate = earlyTilleringDate.toISOString().split('T')[0];

                // Calculate Mid Tillering (Planting Date + 14 days)
                const midTilleringDate = new Date(earlyTilleringDate);
                midTilleringDate.setDate(earlyTilleringDate.getDate() + 15);
                const formattedMidTilleringDate = midTilleringDate.toISOString().split('T')[0];

                // Calculate Max Tillering (Planting Date + 25 days)
                const maxTilleringDate = new Date(midTilleringDate);
                maxTilleringDate.setDate(midTilleringDate.getDate() + 15);
                const formattedMaxTilleringDate = maxTilleringDate.toISOString().split('T')[0];

                // calculate PI (maturity date - 60 days)
                const piDate = new Date(maxTilleringDate);
                piDate.setDate(maxTilleringDate.getDate() + 10);
                const formattedPiDate = piDate.toISOString().split('T')[0];

                // Calculate Booting (PI + 10 days)
                const bootingDate = new Date(maturityDate);
                bootingDate.setDate(maturityDate.getDate() - 60);
                const formattedBootingDate = bootingDate.toISOString().split('T')[0];

                // Calculate Flowering (Booting + 7 days)
                const floweringDate = new Date(bootingDate);
                floweringDate.setDate(bootingDate.getDate() + 7);
                const formattedFloweringDate = floweringDate.toISOString().split('T')[0];

                // Calculate Complete flowering (Flowering + 13 days)
                const completeFloweringDate = new Date(floweringDate);
                completeFloweringDate.setDate(floweringDate.getDate() + 13);
                const formattedCompleteFloweringDate = completeFloweringDate.toISOString().split('T')[0];

                // Calculate Heading stage (Flowering + 7 days)
                const headingDate = new Date(completeFloweringDate);
                headingDate.setDate(completeFloweringDate.getDate() + 7);
                const formattedHeadingDate = headingDate.toISOString().split('T')[0];

                // Calculate Milk stage (heading + 7 days)
                const milkStageDate = new Date(headingDate);
                milkStageDate.setDate(headingDate.getDate() + 7);
                const formattedMilkStageDate = milkStageDate.toISOString().split('T')[0];

                // Calculate Soft dough (Milk stage + 7 days)
                const softDoughDate = new Date(milkStageDate);
                softDoughDate.setDate(milkStageDate.getDate() + 6);
                const formattedSoftDoughDate = softDoughDate.toISOString().split('T')[0];

                // Calculate Hard dough (Soft dough + 5 days)
                const hardDoughDate = new Date(softDoughDate);
                hardDoughDate.setDate(softDoughDate.getDate() + 5);
                const formattedHardDoughDate = hardDoughDate.toISOString().split('T')[0];



                setFormData((prev) => ({
                    ...prev,
                    vegetativePhases: {
                        "Early Tillering": formattedEarlyTilleringDate,
                        "Mid Tillering": formattedMidTilleringDate,
                        "Max Tillering": formattedMaxTilleringDate
                    },
                    reproductivePhases: {
                        ...prev.reproductivePhases,
                        "Flowering Initiation": formattedFloweringDate,
                        "Complete flowering": formattedCompleteFloweringDate,
                        "PI": formattedPiDate,
                        "Milk stage": formattedMilkStageDate,
                        "Soft dough": formattedSoftDoughDate,
                        "Hard dough": formattedHardDoughDate,
                        "Booting": formattedBootingDate,
                        "Heading": formattedHeadingDate
                    },

                }));
            } else {
                setFormData((prev) => ({
                    ...prev,
                    vegetativePhases: {
                        "Early Tillering": "",
                        "Mid Tillering": "",
                        "Max Tillering": ""
                    },
                    reproductivePhases: {
                        ...prev.reproductivePhases,
                        "Flowering": "",
                        "PI": "",
                        "Milk stage": "",
                        "Soft dough": "",
                        "Hard dough": "",
                        "Booting": "",
                        "Heading": ""
                    },
                }));
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                vegetativePhases: {
                    "Early Tillering": "",
                    "Mid Tillering": "",
                    "Max Tillering": ""
                },
                reproductivePhases: {
                    ...prev.reproductivePhases,
                    "Flowering": "",
                    "PI": "",
                    "Milk stage": "",
                    "Soft dough": "",
                    "Hard dough": "",
                    "Booting": "",
                    "Heading": ""
                },
            }));
        }
    }, [formData.datePlanting, formData.maturity]);
    const handleReproductivePhaseChange = (phase, value) => {
        setFormData((prev) => ({
            ...prev,
            reproductivePhases: {
                ...prev.reproductivePhases,
                [phase]: value
            }
        }));
    };

    const handleMainChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setGpsError('Geolocation is not supported by this browser.');
            return;
        }

        setIsGpsLoading(true);
        setGpsError('');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setFormData({
                    ...formData,
                    lat: latitude.toFixed(6),
                    lan: longitude.toFixed(6),
                });
                setIsGpsLoading(false);
            },
            (error) => {
                let errorMessage = 'Failed to get location.';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Permission to access location was denied.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'The request to get location timed out.';
                        break;
                }
                setGpsError(errorMessage);
                setIsGpsLoading(false);
            }
        );
    };


    const validateForm = () => {
        const newErrors = {};
        if (!formData.year) newErrors.year = 'Year is required';
        if (!formData.season) newErrors.season = 'Season is required';
        if (!formData.dateSurvey) newErrors.dateSurvey = 'Survey Date is required';
        if (!formData.datePlanting) newErrors.datePlanting = 'Planting Date is required';
        if (!formData.surveySite) newErrors.surveySite = 'Survey Site is required';
        if (!formData.variety) newErrors.variety = 'Variety is required';
        if (!formData.growthStage) newErrors.growthStage = 'Growth Stage is required';
        formData.diseaseEntries.forEach((entry, index) => {
            if (entry.diseaseName && !entry.diseaseSeverity) {
                newErrors[`diseaseSeverity_${index}`] = 'Severity is required if Disease is selected';
            }
            if (entry.diseaseName && !entry.diseasesIncident) {
                newErrors[`diseasesIncident_${index}`] = 'Incident is required if Disease is selected';
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        const method = isEdit ? 'PUT' : 'POST';
        const url = `https://iinms.brri.gov.bd/api/surveys${isEdit ? `/${formData.id}` : ''}`;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                alert(`Failed to ${isEdit ? 'update' : 'save'} data: ${errorData.message || 'Please try again later.'}`);
                setIsLoading(false);
                return;
            }

            const result = await response.json();
            onSave(result, isEdit);
            resetForm();
            onClose();
        } catch (error) {
            console.error('Network Error:', error);
            alert('Network error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            id: '',
            year: '',
            lat: '',
            lan: '',
            season: '',
            dateSurvey: '',
            datePlanting: '',
            ageSeedling: '',
            growthDuration: '',
            surveySite: '',
            fieldArea: '',
            variety: '',
            growthStage: '',
            temperature: '',
            rainfall: '',
            relativeHumidity: '',
            diseaseEntries: [{ diseaseName: '', diseaseSeverity: '', remarks: '', diseasesIncident: '', diseasesIncidentRemarks: '', images: [] }],
        });
        setErrors({});
        setGpsError('');
        setIsImageUploading({});
    };

    if (!isOpen) return null;

    return (
        <div className="fixed max-w-[150vh] inset-0 z-[999999] p-2 sm:p-4 bg-gray-600 bg-opacity-50 flex items-center justify-center overflow-y-auto">
            <div className="bg-white px-4 sm:px-6 py-6 sm:py-8 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">{isEdit ? 'Edit Data' : 'Add New Data'}</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                    {/* Year */}
                    <div>
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <input
                            id="year"
                            name="year"
                            value={formData.year}
                            onChange={handleMainChange}
                            placeholder="Year"
                            className={`p-2 border w-full rounded text-sm ${errors.year ? 'border-red-500' : ''}`}
                        />
                        {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
                    </div>

                    {/* Latitude & Longitude + GPS Button */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <div className="flex-1">
                            <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                            <input
                                id="lat"
                                name="lat"
                                value={formData.lat}
                                onChange={handleMainChange}
                                placeholder="Latitude"
                                className="p-2 border w-full rounded text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="lan" className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                            <input
                                id="lan"
                                name="lan"
                                value={formData.lan}
                                onChange={handleMainChange}
                                placeholder="Longitude"
                                className="p-2 border w-full rounded text-sm"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleGetLocation}
                                disabled={isGpsLoading}
                                className={`p-2 bg-blue-500 text-white rounded w-full sm:w-12 h-10 flex items-center justify-center ${isGpsLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                                type="button"
                            >
                                {isGpsLoading ? 'Fetching...' : <MdMyLocation />}
                            </button>
                        </div>
                    </div>

                    {/* Season */}
                    <div>
                        <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                        <select
                            id="season"
                            name="season"
                            value={formData.season}
                            onChange={handleMainChange}
                            className={`p-2 border w-full rounded text-sm ${errors.season ? 'border-red-500' : ''}`}
                        >
                            <option value="">Select Season</option>
                            <option value="Aus">Aus</option>
                            <option value="Aman">Aman</option>
                            <option value="Boro">Boro</option>
                        </select>
                        {errors.season && <p className="text-red-500 text-xs mt-1">{errors.season}</p>}
                    </div>

                    {/* Survey Date */}
                    <div>
                        <label htmlFor="dateSurvey" className="block text-sm font-medium text-gray-700 mb-1">Survey Date</label>
                        <input
                            id="dateSurvey"
                            name="dateSurvey"
                            value={formData.dateSurvey}
                            onChange={handleMainChange}
                            type="date"
                            className={`p-2 border w-full rounded text-sm ${errors.dateSurvey ? 'border-red-500' : ''}`}
                        />
                        {errors.dateSurvey && <p className="text-red-500 text-xs mt-1">{errors.dateSurvey}</p>}
                    </div>
                    {/* Survey Site */}
                    <div>
                        <label htmlFor="surveySite" className="block text-sm font-medium text-gray-700 mb-1">Survey Site</label>
                        <select
                            id="surveySite"
                            name="surveySite"
                            value={formData.surveySite}
                            onChange={handleMainChange}
                            className={`p-2 border w-full rounded text-sm ${errors.surveySite ? 'border-red-500' : ''}`}
                        >
                            <option value="">Select Site</option>
                            <option value="Trial">Trial</option>
                            <option value="Farmers Field">Farmers Field</option>
                            <option value="Demonstration">Demonstration</option>
                        </select>
                        {errors.surveySite && <p className="text-red-500 text-xs mt-1">{errors.surveySite}</p>}
                    </div>
                    {/* Age of Seedling */}
                    <div>
                        <label htmlFor="ageSeedling" className="block text-sm font-medium text-gray-700 mb-1">Age of Seedling (days)</label>
                        <input
                            id="ageSeedling"
                            name="ageSeedling"
                            value={formData.ageSeedling}
                            onChange={handleMainChange}
                            placeholder="Age of Seedling"
                            className="p-2 border w-full rounded text-sm"
                        />
                    </div>
                    {/* Planting Date */}
                    <div>
                        <label htmlFor="datePlanting" className="block text-sm font-medium text-gray-700 mb-1">Planting Date</label>
                        <input
                            id="datePlanting"
                            name="datePlanting"
                            value={formData.datePlanting}
                            onChange={handleMainChange}
                            type="date"
                            className={`p-2 border w-full rounded text-sm ${errors.datePlanting ? 'border-red-500' : ''}`}
                        />
                        {errors.datePlanting && <p className="text-red-500 text-xs mt-1">{errors.datePlanting}</p>}
                    </div>



                    {/* Growth Duration */}
                    <div>
                        <label htmlFor="growthDuration" className="block text-sm font-medium text-gray-700 mb-1">Growth Duration (days)</label>
                        <input
                            id="growthDuration"
                            name="growthDuration"
                            value={formData.growthDuration}
                            onChange={handleMainChange}
                            placeholder="Growth Duration"
                            className="p-2 border w-full rounded text-sm"
                        />
                    </div>
                    {/* Field Area */}
                    <div>
                        <label htmlFor="fieldArea" className="block text-sm font-medium text-gray-700 mb-1">Field Area (Decimal)</label>
                        <input
                            id="fieldArea"
                            name="fieldArea"
                            value={formData.fieldArea}
                            onChange={handleMainChange}
                            placeholder="Field Area"
                            className="p-2 border w-full rounded text-sm"
                        />
                    </div>

                    {/* Variety */}
                    <div>
                        <label htmlFor="variety" className="block text-sm font-medium text-gray-700 mb-1">Variety</label>
                        <input
                            id="variety"
                            name="variety"
                            value={formData.variety}
                            onChange={handleMainChange}
                            placeholder="Variety"
                            className={`p-2 border w-full rounded text-sm ${errors.variety ? 'border-red-500' : ''}`}
                        />
                        {errors.variety && <p className="text-red-500 text-xs mt-1">{errors.variety}</p>}
                    </div>

                    {/* Growth Stage */}
                    <div>
                        <label htmlFor="growthStage" className="block text-sm font-medium text-gray-700 mb-1">Growth Stage</label>
                        <select
                            id="growthStage"
                            name="growthStage"
                            value={formData.growthStage}
                            onChange={handleMainChange}
                            className={`p-2 border w-full rounded text-sm ${errors.growthStage ? 'border-red-500' : ''}`}
                        >
                            <option value="">Select Stage</option>
                            {["Germination", "Seedling Stage", "Tillering", "Maximum Tillering", "PI", "Booting", "Heading", "Flowering", "Milk stage", "Soft dough", "Hard dough", "Maturity"].map(stage => (
                                <option key={stage} value={stage}>{stage}</option>
                            ))}
                        </select>
                        {errors.growthStage && <p className="text-red-500 text-xs mt-1">{errors.growthStage}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 col-span-2">
                        {/* Vegetative Phases */}
                        <div className="bg-white p-4 rounded shadow-sm border">
                            <h3 className="text-md font-semibold text-gray-800 mb-4 border-b pb-2">
                                Vegetative Phases
                            </h3>
                            {vegetativePhases.map((phase) => (
                                <div key={phase} className="flex items-center gap-3 mb-3">
                                    <label className="w-40 text-sm text-gray-600">{phase}</label>
                                    <input
                                        type="text"
                                        placeholder="Enter value"
                                        disabled
                                        className="p-2 border rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.vegetativePhases?.[phase] || ""}
                                        onChange={(e) =>
                                            handleVegetativePhaseChange(phase, e.target.value)
                                        }
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Reproductive Phases */}
                        <div className="bg-white p-4 rounded shadow-sm border">
                            <h3 className="text-md font-semibold text-gray-800 mb-4 border-b pb-2">
                                Reproductive Phases
                            </h3>
                            {reproductivePhases.map((phase) => (
                                <div key={phase} className="flex items-center gap-3 mb-3">
                                    <label className="w-40 text-sm text-gray-600">{phase}</label>
                                    <input
                                        type="text"
                                        placeholder="Enter value"
                                        disabled
                                        className="p-2 border rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.reproductivePhases?.[phase] || ""}
                                        onChange={(e) =>
                                            handleReproductivePhaseChange(phase, e.target.value)
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                        {/* Maturity */}
                        <div className="bg-white p-4 rounded shadow-sm border h-fit">
                            <label
                                htmlFor="maturity"
                                className="block text-sm font-semibold text-gray-800 mb-2"
                            >
                                Maturity
                            </label>
                            <input
                                id="maturity"
                                name="maturity"
                                disabled
                                value={formData.maturity}
                                onChange={handleMainChange}
                                placeholder="Enter maturity"
                                className="p-2 border w-full rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                </div>
                <div className="mt-4 sm:mt-6 flex justify-end gap-2 sm:gap-3">
                    <button
                        onClick={onClose}
                        className="px-3 sm:px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm sm:text-base"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className={`px-3 sm:px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm sm:text-base ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const GrowthStageSurvey = () => {
    const [data, setData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [isFetching, setIsFetching] = useState(false);

    const initialColumns = [
        { name: "ID", visible: true },
        { name: "Year", visible: true },
        { name: "Latitude", visible: true },
        { name: "Longitude", visible: true },
        { name: "Season", visible: true },
        { name: "Date of Survey", visible: true },
        { name: "Date of Planting", visible: true },
        { name: "Age of Seedling", visible: true },
        { name: "Growth Duration", visible: true },
        { name: "Survey Site", visible: true },
        { name: "Field Area (Decimal)", visible: true },
        { name: "Variety", visible: true },
        { name: "Growth Stage", visible: true },
        { name: "Temperature (°C)", visible: true },
        { name: "Rainfall (mm)", visible: true },
        { name: "Relative Humidity (%)", visible: true },
        { name: "Diseases", visible: true },
        { name: "Action", visible: true },
    ];

    const [columns, setColumns] = useState(initialColumns);

    const columnKeyMap = {
        ID: "id",
        Year: "year",
        Latitude: "lat",
        Longitude: "lan",
        Season: "season",
        "Date of Survey": "dateSurvey",
        "Date of Planting": "datePlanting",
        "Age of Seedling": "ageSeedling",
        "Growth Duration": "growthDuration",
        "Survey Site": "surveySite",
        "Field Area (Decimal)": "fieldArea",
        Variety: "variety",
        "Growth Stage": "growthStage",
        "Temperature (°C)": "temperature",
        "Rainfall (mm)": "rainfall",
        "Relative Humidity (%)": "relativeHumidity",
        Diseases: "diseaseEntries",
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsFetching(true);
            try {
                const response = await fetch('https://iinms.brri.gov.bd/api/surveys', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Fetch Error:', errorData);
                    alert('Failed to fetch data. Please try again later.');
                    setIsFetching(false);
                    return;
                }

                const result = await response.json();
                setData(result);
                setIsFetching(false);
            } catch (error) {
                console.error('Network Error:', error);
                alert('Network error occurred while fetching data. Please try again.');
                setIsFetching(false);
            }
        };

        fetchData();
    }, []);

    const filteredData = data.filter((row) =>
        Object.values(row)
            .filter((value) => typeof value !== 'object')
            .some((value) =>
                value?.toString().toLowerCase().includes(searchText.toLowerCase())
            ) ||
        row.diseaseEntries.some((entry) =>
            entry.diseaseName.toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const key = columnKeyMap[sortConfig.key];
        let valueA = key === "diseaseEntries"
            ? a[key].map((e) => e.diseaseName).join(', ')
            : a[key] || '';
        let valueB = key === "diseaseEntries"
            ? b[key].map((e) => e.diseaseName).join(', ')
            : b[key] || '';

        if (sortConfig.key === 'ID' || sortConfig.key === 'Year' || sortConfig.key === 'Age of Seedling' || sortConfig.key === 'Growth Duration' ||
            sortConfig.key === 'Field Area (Decimal)' || sortConfig.key === 'Temperature (°C)' || sortConfig.key === 'Rainfall (mm)' ||
            sortConfig.key === 'Relative Humidity (%)') {
            valueA = Number(valueA) || 0;
            valueB = Number(valueB) || 0;
        }

        if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const paginatedData = sortedData.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    const handleAddData = (newData, isEdit) => {
        if (isEdit && editIndex !== null) {
            const updatedData = [...data];
            updatedData[editIndex] = newData;
            setData(updatedData);
            setEditIndex(null);
        } else {
            setData([...data, newData]);
        }
        setIsModalOpen(false);
    };

    const handleEdit = (index) => {
        setEditIndex(index);
        setIsModalOpen(true);
    };

    const handleDelete = async (index) => {
        if (!window.confirm("Are you sure you want to delete this entry?")) return;

        const surveyId = data[index].id;

        try {
            const response = await fetch(`https://iinms.brri.gov.bd/api/surveys/${surveyId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Delete Error:', errorData);
                alert('Failed to delete data. Please try again later.');
                return;
            }

            setData(data.filter((_, i) => i !== index));
            if (page > Math.ceil((data.length - 1) / rowsPerPage)) {
                setPage(page - 1 || 1);
            }
        } catch (error) {
            console.error('Network Error:', error);
            alert('Network error occurred while deleting data. Please try again.');
        }
    };

    const handleSort = (columnName) => {
        setSortConfig((prev) => ({
            key: columnName,
            direction: prev.key === columnName && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const toggleColumnModal = () => setIsColumnModalOpen(!isColumnModalOpen);

    const handleColumnToggle = (columnName) => {
        setColumns((prevColumns) =>
            prevColumns.map((col) =>
                col.name === columnName ? { ...col, visible: !col.visible } : col
            )
        );
    };

    const handleCopy = async () => {
        try {
            const visibleColumns = columns.filter((col) => col.visible && col.name !== "Action");
            const header = visibleColumns.map((col) => col.name).join("\t");
            const rows = paginatedData.map((row) =>
                visibleColumns
                    .map((col) => {
                        if (col.name === "Diseases") {
                            return row.diseaseEntries
                                .map((entry) =>
                                    `${entry.diseaseName} (Severity: ${entry.diseaseSeverity}, Incident: ${entry.diseasesIncident}%)`
                                )
                                .join('; ');
                        }
                        const key = columnKeyMap[col.name];
                        return row[key] || '';
                    })
                    .join("\t")
            );
            const text = `${header}\n${rows.join("\n")}`;
            await navigator.clipboard.writeText(text);
            alert("Table data copied to clipboard!");
        } catch (error) {
            console.error("Copy failed:", error);
            alert("Failed to copy data to clipboard. Please try again.");
        }
    };

    const handleExportCSV = () => {
        try {
            const visibleColumns = columns.filter((col) => col.visible && col.name !== "Action");
            const fields = visibleColumns.map((col) => ({
                label: col.name,
                value: col.name.toLowerCase().replace(/\s+/g, ''),
            }));

            const csvData = paginatedData.map((row) => {
                const rowData = {};
                visibleColumns.forEach((col) => {
                    const keyAlias = col.name.toLowerCase().replace(/\s+/g, '');
                    if (col.name === "Diseases") {
                        rowData[keyAlias] = row.diseaseEntries
                            .map((entry) =>
                                `${entry.diseaseName} (Severity: ${entry.diseaseSeverity}, Incident: ${entry.diseasesIncident}%)`
                            )
                            .join('; ');
                    } else {
                        const key = columnKeyMap[col.name];
                        rowData[keyAlias] = row[key] || '';
                    }
                });
                return rowData;
            });

            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(csvData);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "disease_survey.csv";
            link.click();
        } catch (error) {
            console.error("CSV export failed:", error);
            alert("Failed to export CSV. Please try again.");
        }
    };

    const handleExportPDF = () => {
        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 12;

            doc.setFont(undefined, "normal");
            doc.setFontSize(12);

            // Header
            doc.setFontSize(12);
            doc.setTextColor(50);
            doc.setFont("helvetica", "bold");
            doc.text("Bangladesh Rice Research Institute (BRRI)", margin + 18, 15);
            doc.setFontSize(10);
            doc.setTextColor(100);
            const date = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            };
            const formattedDate = date.toLocaleString('en-US', options);
            doc.setFont(undefined, "normal");
            doc.text(formattedDate, pageWidth - margin, 35, { align: "right" });
            doc.setFontSize(10);
            doc.setTextColor(50);
            doc.text("Gazipur-1701", margin + 18, 20);
            doc.setFont("helvetica", "bold");
            doc.text("Contact Agromet Lab", margin + 18, 25);
            doc.setFont(undefined, "normal");
            doc.text("Email: info.brriagromet@gmail.com", margin + 18, 30);
            doc.text("Mobile: 09644300300", margin + 18, 35);

            // Prepare table data
            const visibleColumns = columns.filter((col) => col.visible && col.name !== "Action");
            const headers = visibleColumns.map((col) => col.name);
            const tableData = paginatedData.map((row) =>
                visibleColumns.map((col) => {
                    if (col.name === "Diseases") {
                        return row.diseaseEntries
                            .map((entry) =>
                                `${entry.diseaseName} (Severity: ${entry.diseaseSeverity}, Incident: ${entry.diseasesIncident}%)`
                            )
                            .join('; ');
                    }
                    const key = columnKeyMap[col.name];
                    return row[key] || '';
                })
            );

            // Table
            autoTable(doc, {
                startY: 40,
                head: [headers],
                body: tableData,
                theme: 'grid',
                styles: {
                    font: "helvetica",
                    fontSize: 8,
                    cellPadding: 2,
                    textColor: [50, 50, 50],
                    overflow: 'linebreak',
                },
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontStyle: 'bold',
                    halign: 'center',
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245],
                },
                margin: { top: 45, left: margin, right: margin, bottom: 20 },
                didDrawPage: (data) => {
                    const pageCount = doc.internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.setTextColor(100);
                    doc.text(
                        `Page ${data.pageNumber} of ${pageCount}`,
                        pageWidth / 2,
                        pageHeight - 12,
                        { align: "center" }
                    );
                    doc.text(
                        "© 2025 Smart Agro-Advisory Dissemination System.",
                        margin,
                        pageHeight - 6
                    );
                    doc.text(
                        "Generated by: Admin",
                        pageWidth - margin,
                        pageHeight - 6,
                        { align: "right" }
                    );
                },
            });

            doc.save("disease_survey.pdf");
        } catch (error) {
            console.error("PDF export failed:", error);
            alert("Failed to export PDF. Please try again.");
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-100">
            <main className="p-6">
                <div className="container mx-auto bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-bold">Growth Stage Survey Data</h1>
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            onClick={() => {
                                setEditIndex(null);
                                setIsModalOpen(true);
                            }}
                        >
                            + Add Data
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between mt-4 w-full space-y-3 md:space-y-0">
                        <input
                            type="text"
                            placeholder="Search by ID, Year, Season, Site, Variety, or Disease"
                            className="border rounded px-4 py-2 w-full md:w-1/2 lg:w-1/3 text-sm"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <div className="flex flex-wrap justify-between md:justify-end space-x-2">
                            <input
                                type="number"
                                className="border rounded px-4 py-2 text-sm"
                                value={rowsPerPage}
                                onChange={(e) => setRowsPerPage(parseInt(e.target.value) || 10)}
                                min={1}
                                placeholder="Rows per page"
                            />
                            <button
                                className="border px-4 py-2 rounded hover:bg-gray-100 text-sm"
                                onClick={handleCopy}
                            >
                                Copy
                            </button>
                            <button
                                className="border px-4 py-2 rounded hover:bg-gray-100 text-sm"
                                onClick={handleExportCSV}
                            >
                                CSV
                            </button>
                            <button
                                className="border px-4 py-2 rounded hover:bg-gray-100 text-sm"
                                onClick={handleExportPDF}
                            >
                                PDF
                            </button>
                            <button
                                className="border px-4 py-2 rounded hover:bg-gray-100 flex items-center justify-center"
                                onClick={toggleColumnModal}
                            >
                                <FaBars className="text-lg" />
                            </button>
                        </div>
                    </div>

                    {isFetching ? (
                        <div className="text-center py-4">Loading data...</div>
                    ) : (
                        <div className="max-w-[150vh] overflow-x-scroll overflow-auto max-h-[500px] custom-scrollbar">
                            <table className="table-fixed w-full mt-4 border rounded-lg">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-gray-50 text-sm border-b">
                                        {columns
                                            .filter((col) => col.visible)
                                            .map((col, index) => (
                                                <th
                                                    key={col.name}
                                                    className={`border px-4 py-2 cursor-pointer ${index === 0 ? "sticky left-0 bg-gray-50" : ""} text-sm font-medium text-gray-700`}
                                                    style={{ width: col.name === "ID" ? "80px" : index === 0 ? "50px" : "150px" }}
                                                    onClick={() => handleSort(col.name)}
                                                >
                                                    <p className="flex items-center justify-between">
                                                        {col.name}
                                                        <ChevronsUpDown size={14} />
                                                        {sortConfig.key === col.name && (
                                                            <span className="ml-1">
                                                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                            </span>
                                                        )}
                                                    </p>
                                                </th>
                                            ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((row, index) => (
                                        <tr className="text-sm" key={row.id || index} style={{ height: "50px" }}>
                                            {columns
                                                .filter((col) => col.visible)
                                                .map((col, colIndex) => (
                                                    <td
                                                        key={col.name}
                                                        className={`border px-4 py-2 ${colIndex === 0 ? "sticky left-0" : ""} ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} text-sm`}
                                                        style={{ width: col.name === "ID" ? "80px" : colIndex === 0 ? "50px" : "150px" }}
                                                    >
                                                        {col.name === "ID" && row.id}
                                                        {col.name === "Year" && row.year}
                                                        {col.name === "Latitude" && row.lat}
                                                        {col.name === "Longitude" && row.lan}
                                                        {col.name === "Season" && row.season}
                                                        {col.name === "Date of Survey" && row.dateSurvey}
                                                        {col.name === "Date of Planting" && row.datePlanting}
                                                        {col.name === "Age of Seedling" && row.ageSeedling}
                                                        {col.name === "Growth Duration" && row.growthDuration}
                                                        {col.name === "Survey Site" && row.surveySite}
                                                        {col.name === "Field Area (Decimal)" && row.fieldArea}
                                                        {col.name === "Variety" && row.variety}
                                                        {col.name === "Growth Stage" && row.growthStage}
                                                        {col.name === "Temperature (°C)" && row.temperature}
                                                        {col.name === "Rainfall (mm)" && row.rainfall}
                                                        {col.name === "Relative Humidity (%)" && row.relativeHumidity}
                                                        {col.name === "Diseases" && (
                                                            <div>
                                                                {row.diseaseEntries.map((entry, i) => (
                                                                    <div key={i} className="mb-2">
                                                                        <div>
                                                                            {entry.diseaseName} (Severity: {entry.diseaseSeverity}, Incident: {entry.diseasesIncident}%)
                                                                        </div>
                                                                        {entry.images && entry.images.length > 0 && (
                                                                            <div className="flex flex-wrap gap-2 mt-1">
                                                                                {entry.images.map((url, imgIndex) => (
                                                                                    <div key={imgIndex} className="relative group">
                                                                                        <img
                                                                                            src={url}
                                                                                            alt={`Disease Image ${imgIndex + 1}`}
                                                                                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 shadow-sm transition-transform group-hover:scale-105"
                                                                                        />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {col.name === "Action" && (
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                                                    onClick={() => handleEdit((page - 1) * rowsPerPage + index)}
                                                                >
                                                                    <FaEdit />
                                                                </button>
                                                                <button
                                                                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                                                    onClick={() => handleDelete((page - 1) * rowsPerPage + index)}
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="flex justify-between items-center w-full mt-5 md:hidden lg:hidden">
                        <label className="mr-2 w-1/2">Jump to page:</label>
                        <input
                            type="number"
                            value={page}
                            onChange={(e) => setPage(parseInt(e.target.value) || 1)}
                            className="px-2 py-2 border rounded border-gray-300 w-1/2 text-sm"
                        />
                    </div>
                    <div className="mt-4 flex justify-between items-center text-sm">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="px-4 py-2 bg-gray-500 text-white rounded disabled:bg-gray-300"
                        >
                            Previous
                        </button>
                        <span>
                            Page {page} of {totalPages}
                        </span>
                        <div className="hidden md:block lg:block text-sm">
                            <label className="mr-2">Jump to page:</label>
                            <input
                                type="number"
                                value={page}
                                onChange={(e) => setPage(parseInt(e.target.value) || 1)}
                                className="px-2 py-2 border rounded border-gray-300 text-sm"
                            />
                        </div>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-gray-500 text-white rounded disabled:bg-gray-300"
                        >
                            Next
                        </button>
                    </div>
                </div>

                {isColumnModalOpen && (
                    <div
                        className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-end"
                        onClick={toggleColumnModal}
                    >
                        <div
                            className="bg-white rounded shadow-lg w-full md:w-1/4 lg:w-1/5 py-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ul className="space-y-2 max-h-[50vh] overflow-y-scroll">
                                {columns.map((col) => (
                                    <li
                                        key={col.name}
                                        className={`flex items-center cursor-pointer px-3 space-x-2 ${col.visible ? "bg-gray-200 p-1 px-3" : ""}`}
                                        onClick={() => handleColumnToggle(col.name)}
                                    >
                                        <span>{col.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditIndex(null);
                    }}
                    onSave={handleAddData}
                    initialData={editIndex !== null ? data[editIndex] : null}
                    isEdit={editIndex !== null}
                />
            </main>
        </div>
    );
};

export default GrowthStageSurvey;