var moment = moment || false;
if (!moment) {
	console.error("This page requires moment.js and moment-timezone.js");
}

const date = (function () {
	var date = {
		vendorRefreshDate: function vendorRefreshDate(vendor) {
			if (vendor.nextRefreshDate) {
				var days = moment(vendor.nextRefreshDate).diff(moment(), "days");
				if (days > 100) {
					return "";
				}
				var hours = pad(Array(3).join("0"), moment(vendor.nextRefreshDate).diff(moment(), "hours") % 24, true);
				var minutes = pad(Array(3).join("0"), moment(vendor.nextRefreshDate).diff(moment(), "minutes") % 60, true);
				var seconds = pad(Array(3).join("0"), moment(vendor.nextRefreshDate).diff(moment(), "seconds") % 60, true);
				return `<span class="resetDate" data-date="${vendor.nextRefreshDate}">STOCK REFRESH ${days} ${(days > 1)? "Days" : "Day"} ${hours}:${minutes}:${seconds}</span>`;
			}
			return "";
		},
		keepDatesUpdated: function keepDatesUpdated() {
			var dates = document.querySelectorAll(".resetDate");
			for (var resetDate of dates) {
				var vendorDate = moment(resetDate.dataset.date);
				var now = moment();
				var days = vendorDate.diff(now, "days");
				var hours = pad(Array(3).join("0"), vendorDate.diff(now, "hours") % 24, true);
				var minutes = pad(Array(3).join("0"), vendorDate.diff(now, "minutes") % 60, true);
				var seconds = pad(Array(3).join("0"), vendorDate.diff(now, "seconds") % 60, true);
				resetDate.innerHTML = `STOCK REFRESH ${days} ${(days > 1)? "Days" : "Day"} ${hours}:${minutes}:${seconds}`;
			}
			window.requestAnimationFrame(date.keepDatesUpdated);
		}
	};
	return date;
}());