document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Por favor, inicia sesión para ver tu historial.');
        window.location.href = 'login.html'; // Redirigir a la página de inicio de sesión
        return;
    }

    fetch('http://localhost:3000/api/history', {
        headers: {
            'Authorization': `Bearer ${token}` // Asegúrate de incluir "Bearer"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar el historial');
        }
        return response.json();
    })
    .then(data => {
        const historyTableBody = document.getElementById('historyTableBody');
        data.forEach(route => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${route.origen}</td>
                <td>${route.destino}</td>
                <td>${new Date(route.fecha).toLocaleString()}</td>
                <td>${route.precio}</td>
            `;
            historyTableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error al cargar el historial:', error);
        alert('Error al cargar el historial.');
    });
});
