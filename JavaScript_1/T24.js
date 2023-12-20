function pyydaNimi() {
    var nimi = prompt("Anna nimesi:");

    if (nimi !== null && nimi !== "") {
        var isoNimi = nimi.toUpperCase();
        var nimiTulosElementti = document.getElementById("nimiTulos");
        nimiTulosElementti.textContent = "Syöttämäsi nimi isoilla kirjaimilla: " + isoNimi;
    }
}
