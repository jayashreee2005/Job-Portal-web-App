export default function SearchBar({ search, setSearch }) {
	return (
		<div className="search-bar card">
			<input
				className="input search-input"
				placeholder="Search by title or company"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>
			<button className="button" type="button">
				Search
			</button>
		</div>
	);
}
