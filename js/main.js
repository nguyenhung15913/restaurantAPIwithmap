let restaurantData = []
let currentRestaurant = {}
let page = 1
const perPage = 10
let map = null
const avg = (grades) => _.meanBy(grades, (grade) => grade.score).toFixed(2)
let tableRows = _.template(
	`<% _.forEach(restaurantData, function(restaurant) { %> 
		<tr data-toggle="modal" data-target="#restaurant-modal" data-id=<%- restaurant._id %>>
			<td><%- restaurant.name %></td> 
			<td><%- restaurant.cuisine %></td> 
			<td><%- restaurant.address.building %> <%- restaurant.address.street %></td> 
			<td><%- avg(restaurant.grades) %></td> 
		</tr> 
	<% }) %>`
)

const loadRestaurantData = () => {
	let apiURI = 'https://web422restaurantapi.herokuapp.com/'

	return fetch(`${apiURI}api/restaurants?page=${page}&perPage=${perPage}`)
		.then((res) => res.json())
		.then((result) => {
			restaurantData = result
			let rows = tableRows({ restaurantData: restaurantData })
			$('#restaurant-table tbody').html(rows)
			$('#current-page').html(`${page}`)
		})
}

$(document).ready(function () {
	loadRestaurantData()

	$('#restaurant-table tbody').on('click', 'tr', function () {
		let clickedID = $(this).attr('data-id')
		restaurantData.forEach((restaurant) => {
			if (restaurant._id === clickedID) {
				currentRestaurant = restaurant
			}
		})
		$('.modal-title').text(currentRestaurant.name)
		$('#restaurant-address').text(
			`${currentRestaurant.address.building} ${currentRestaurant.address.street}`
		)
	})

	$('#previous-page').on('click', function (e) {
		if (page > 1) {
			page -= 1
			loadRestaurantData()
		}
	})

	$('#next-page').on('click', function (e) {
		page += 1
		loadRestaurantData()
	})

	$('#restaurant-modal').on('shown.bs.modal', function () {
		map = new L.Map('leaflet', {
			center: [
				currentRestaurant.address.coord[1],
				currentRestaurant.address.coord[0]
			],
			zoom: 18,
			layers: [
				new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
			]
		})

		L.marker([
			currentRestaurant.address.coord[1],
			currentRestaurant.address.coord[0]
		]).addTo(map)
	})

	$('#restaurant-modal').on('hidden.bs.modal', function () {
		map.remove()
	})
})
