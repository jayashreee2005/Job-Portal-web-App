const LOCATIONS = ["Chennai", "Bangalore", "Coimbatore", "Hyderabad", "Pune", "Remote"];
const JOB_TYPES = ["Full Time", "Internship", "Part Time", "Shift"];

export default function Filters({ location, setLocation, selectedTypes, setSelectedTypes }) {
     const handleTypeToggle = (type) => {
          if (selectedTypes.includes(type)) {
               setSelectedTypes(selectedTypes.filter((item) => item !== type));
               return;
          }

          setSelectedTypes([...selectedTypes, type]);
     };

     const clearFilters = () => {
          setLocation("");
          setSelectedTypes([]);
     };

     return (
          <aside className="sidebar card">
               <h3>Filters</h3>

               <div className="filter-item">
                    <p className="label">Location</p>
                    <select className="input" value={location} onChange={(e) => setLocation(e.target.value)}>
                         <option value="">Any location</option>
                         {LOCATIONS.map((city) => (
                              <option key={city} value={city}>
                                   {city}
                              </option>
                         ))}
                    </select>
               </div>

               <div className="filter-item">
                    <p className="label">Job Type</p>
                    {JOB_TYPES.map((type) => (
                         <label key={type}>
                              <input
                                   type="checkbox"
                                   checked={selectedTypes.includes(type)}
                                   onChange={() => handleTypeToggle(type)}
                              />{" "}
                              {type}
                         </label>
                    ))}
               </div>

               <button className="button button-light full-width" type="button" onClick={clearFilters}>
                    Clear Filters
               </button>
          </aside>
     );
}
