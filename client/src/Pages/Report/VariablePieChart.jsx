import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import VariablePie from 'highcharts/modules/variable-pie';
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import Accessibility from 'highcharts/modules/accessibility';
import axios from 'axios';


const VariablePieChart = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [locationType, setLocationType] = useState('union');
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const locationTypes = ['union', 'upazila', 'district', 'division', 'region', 'hotspot'];

    useEffect(() => {
        const fetchData = async () => {
            if (!startDate) return;
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('https://iinms.brri.gov.bd/api/reports/area-wise-counts', {
                    params: { startDate, endDate, locationType },
                });
                setChartData(response.data.data || []);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to fetch data');
                setChartData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [startDate, endDate, locationType]);

    // Map chartData to required Highcharts format
    const data = chartData.map(item => ({
        name: item[locationType], // e.g., union name
        y: item.count,
        z: item.count
    }));

    const options = {
        chart: {
            type: 'variablepie'
        },
        title: {
            text: `Number of Farmers  (%) Distribution by ${locationType.charAt(0).toUpperCase() + locationType.slice(1)}`
        },
        tooltip: {
            headerFormat: '',
            pointFormat:
                '<b>{point.name}</b><br/>' +
                'Count: <b>{point.y}</b><br/>' +
                'Percentage: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            variablepie: {
                dataLabels: {
                    enabled: true,
                    format: '{point.name}: {point.percentage:.1f}%'
                }
            }
        },
        series: [{
            name: 'Location',
            minPointSize: 10,
            innerSize: '40%',
            zMin: 0,
            data
        }],
        exporting: {
            enabled: true
        },
        navigation: {
            buttonOptions: {
                align: 'right',
                verticalAlign: 'top',
                y: 0
            }
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row mb-4 gap-2">
                <div className="flex flex-col w-full sm:w-1/2">
                    <label className="text-sm text-gray-600 mb-1">Start Date</label>
                    <input
                        type="date"
                        className="border p-2 rounded-md shadow-md"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>
                <div className="flex flex-col w-full sm:w-1/2">
                    <label className="text-sm text-gray-600 mb-1">End Date</label>
                    <input
                        type="date"
                        className="border p-2 rounded-md shadow-md"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        min={startDate}
                    />
                </div>
                <div className="flex flex-col w-full sm:w-1/2">
                    <label className="text-sm text-gray-600 mb-1">Location Type</label>
                    <select
                        className="border p-2 h-[42px] rounded-md shadow-md"
                        value={locationType}
                        onChange={(e) => setLocationType(e.target.value)}
                    >
                        {locationTypes.map((type) => (
                            <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && <p className="text-gray-500">Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && data.length > 0 ? (
                <HighchartsReact highcharts={Highcharts} options={options} />
            ) : (
                !loading && <p className="text-gray-500">No data available</p>
            )}
        </div>
    );
};

export default VariablePieChart;
