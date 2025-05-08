document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("forecastButton").addEventListener("click", function () {
        const selectedDate = document.getElementById("forecastDate").value;
        const selectedLocation = document.getElementById("location").value;
        const selectedLocationText = document.getElementById("location").options[document.getElementById("location").selectedIndex].text;
        console.log("Selected Date: ", selectedDate);
        console.log("Selected Location: ", selectedLocation);

        // check if location and date have values
        if (!selectedLocation) return alert("Please select a location!");
        if (!selectedDate) return alert("Please select a date!");
        
        // get and parse forecast data from inputted location and date
        // the data comes from file "<selectedLocation>_updated_forecast.csv"
        // make sure a server (like a simple local server) is running,
        // this is the only way for the JS to read the csv files
        // csv parser doc: https://www.papaparse.com/docs
        const filename = selectedLocation.toLowerCase() + "_updated_forecast.csv";
        console.log("Filename: ", filename)
        Papa.parse(filename, {
            download: true,
            header: true,
            complete: function (results) {
                const targetDate = formatCSVDate(selectedDate);
                console.log("Target Date: ", targetDate);
                const match = results.data.find(row => row["Date"] === targetDate);

                if (!match) return alert("No data found for " + targetDate + "!");
                
                // build card for chosen's forecast/weather
                const chosenOutput = `
                    <div class="card px-0">
                        <div class="card-header">
                            <h6 class="text-uppercase text-center text-body-secondary my-4">
                                ${selectedLocationText}
                            </h6>
                            <div class="row g-0 align-items-center justify-content-center">
                                <div class="col-auto">
                                    <div class="display-2 mb-0">${((parseFloat(match["Temperature (mean)(Centigrade)"]) * (9/5)) + 32).toFixed(1)}°F</div>
                                </div>
                            </div>
                            <div class="h6 text-uppercase text-center text-body-secondary mb-5">
                                ${match["Date"]}
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item d-flex align-items-center justify-content-between px-0">
                                        <small>Precipitation (in)</small> <small>${(parseFloat(match["Precipitation (cm/day)"]) * 0.393701).toFixed(2)}</small>
                                    </li>
                                    <li class="list-group-item d-flex align-items-center justify-content-between px-0">
                                        <small>Humidity</small> <small>${parseFloat(match["Daylight Relative Humidity (%)"]).toFixed(0)}%</small>
                                    </li>
                                    <li class="list-group-item d-flex align-items-center justify-content-between px-0">
                                        <small>Solar Radiation (Langleys)</small> <small>${parseFloat(match["Solar Radiation (Langleys/day)"]).toFixed(1)}</small>
                                    </li>
                                </ul>
                            </div>                            
                        </div>
                    </div>
                `;
                document.getElementById("chosen-forecast").innerHTML = chosenOutput;
                
                // build weekly forecast table starting from inputted date
                const index = results.data.findIndex(row => row["Date"] === targetDate);
                const weeklyData = results.data.slice(index, index + 7);
                let weeklyTable = `
                    <table class="table table-bordered" style="font-size: 0.75rem; width: 100%;">
                        <thead>
                            <tr>
                                <th style="text-align: center; vertical-align: middle;">Date</th>
                                <th style="text-align: center; vertical-align: middle;">Temperature</th>
                                <th style="text-align: center; vertical-align: middle;">Precipitation (in)</th>
                                <th style="text-align: center; vertical-align: middle;">Humidity</th>
                                <th style="text-align: center; vertical-align: middle;">Solar Radiation (Langleys)</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                weeklyData.forEach(row => {
                    weeklyTable += `
                        <tr>
                            <td>${row["Date"]}</td>
                            <td>${((parseFloat(row["Temperature (mean)(Centigrade)"]) * (9/5)) + 32).toFixed(1)}°F</td>
                            <td>${(parseFloat(match["Precipitation (cm/day)"]) * 0.393701).toFixed(2)}</td>
                            <td>${parseFloat(row["Daylight Relative Humidity (%)"]).toFixed(0)}%</td>
                            <td>${parseFloat(row["Solar Radiation (Langleys/day)"]).toFixed(1)}</td>
                        </tr>
                    `;
                });
                weeklyTable += `
                        </tbody>
                    </table>
                `;
                document.getElementById("weekly-forecast").innerHTML = weeklyTable;
            },
            error: function () {
                alert("Data for " + selectedLocation + " not found!");
            }
        });
    });
    
    // format the date input into the same date format in CSV
    function formatCSVDate(str) {
        const d = new Date(str + 'T00:00:00Z');
        const month = d.getUTCMonth() + 1;
        const day = d.getUTCDate();
        const year = d.getUTCFullYear();
        return `${month}/${day}/${year}`;
    }
});