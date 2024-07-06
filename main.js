let personas;

// endpoint para la comunicación con la API
const endpoint = 'https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero';

function formatFechaNacimiento(fecha) {
  const date = new Date(fecha);
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  return `${year}${month}${day}`;
}

document.addEventListener('DOMContentLoaded', () => {
  class Persona {
    constructor(id, nombre, apellido, fechaNacimiento) {
      this.id = id;
      this.nombre = nombre;
      this.apellido = apellido;
      this.fechaNacimiento = fechaNacimiento;
    }

    toString() {
      return `ID: ${this.id}, Nombre: ${this.nombre}, Apellido: ${this.apellido}, Fecha de Nacimiento: ${this.fechaNacimiento}`;
    }

    toJson() {
      return JSON.stringify(this);
    }
  }

  class Ciudadano extends Persona {
    constructor(id, nombre, apellido, fechaNacimiento, dni) {
      super(id, nombre, apellido, fechaNacimiento);
      this.dni = dni;
    }

    toString() {
      return `${super.toString()}, DNI: ${this.dni}`;
    }

    toJson() {
      return JSON.stringify(this);
    }
  }

  class Extranjero extends Persona {
    constructor(id, nombre, apellido, fechaNacimiento, paisOrigen) {
      super(id, nombre, apellido, fechaNacimiento);
      this.paisOrigen = paisOrigen;
    }

    toString() {
      return `${super.toString()}, País de Origen: ${this.paisOrigen}`;
    }

    toJson() {
      return JSON.stringify(this);
    }
  }

  const callServiceXHR = () => {
    const spinner = document.getElementById("spinner");
    spinner.style.display = "block"; // Mostrar el spinner al comenzar la solicitud
  
    const xhr = new XMLHttpRequest();
    xhr.open("GET", endpoint, true);
    xhr.setRequestHeader("Content-Type", "application/json");
  
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        spinner.style.display = "none"; // Ocultar el spinner
  
        if (xhr.status == 200) {
          personas = JSON.parse(xhr.responseText);
          updateTable();
        } else {
          console.error("Error en la solicitud:", xhr.status);
        }
      }
    };
    xhr.send();
  };
  

  callServiceXHR();

  // Variables globales para manejar la edición y eliminación
  let editingId = null; // ID de la persona en edición

// Función para actualizar la tabla según la selección del filtro
window.updateTable = function() {
  const filter = document.getElementById("filter").value;
  const tableHeader = document.getElementById("tableHeader");
  const tableBody = document.getElementById("tableBody");
  const addButton = document.getElementById("addButton");

  // Limpiar la tabla antes de actualizar
  tableHeader.innerHTML = "";
  tableBody.innerHTML = "";

  // Determinar qué columnas mostrar según la selección del filtro
  let columnsToShow = [];
  if (filter === "all") {
    columnsToShow = ["id", "nombre", "apellido", "fechaNacimiento", "dni", "paisOrigen", "actions"];
    addButton.style.display = "none"; // Ocultar el botón de agregar
  } else if (filter === "ciudadanos") {
    columnsToShow = ["id", "nombre", "apellido", "fechaNacimiento", "dni", "modify", "delete"];
    addButton.style.display = "block"; // Mostrar el botón de agregar
  } else if (filter === "extranjeros") {
    columnsToShow = ["id", "nombre", "apellido", "fechaNacimiento", "paisOrigen", "modify", "delete"];
    addButton.style.display = "block"; // Mostrar el botón de agregar
  }

  // Crear cabecera de tabla
  const headerRow = document.createElement("tr");
  columnsToShow.forEach(column => {
    const headerCell = document.createElement("th");
    headerCell.textContent = getColumnHeader(column);
    headerRow.appendChild(headerCell);
  });
  tableHeader.appendChild(headerRow);

  // Llenar cuerpo de tabla con datos filtrados
  personas.forEach(persona => {
    if ((filter === "ciudadanos" && persona.dni !== undefined) ||
        (filter === "extranjeros" && persona.paisOrigen !== undefined) ||
        (filter === "all")) {
      const row = document.createElement("tr");
      columnsToShow.forEach(column => {
        const cell = document.createElement("td");
        if (column === "actions") {
          const modifyButton = document.createElement("button");
          modifyButton.innerHTML = "Modificar";
          modifyButton.addEventListener("click", () => showModifyForm(persona));
          const deleteButton = document.createElement("button");
          deleteButton.innerHTML = "Eliminar";
          deleteButton.addEventListener("click", () => confirmDelete(persona.id));
          cell.appendChild(modifyButton);
          cell.appendChild(deleteButton);
        } else if (column === "modify") {
          const modifyButton = document.createElement("button");
          modifyButton.innerHTML = "Modificar";
          modifyButton.addEventListener("click", () => showModifyForm(persona));
          cell.appendChild(modifyButton);
        } else if (column === "delete") {
          const deleteButton = document.createElement("button");
          deleteButton.innerHTML = "Eliminar";
          deleteButton.addEventListener("click", () => confirmDelete(persona.id));
          cell.appendChild(deleteButton);
        } else {
          cell.textContent = persona[column] || ""; // Mostrar valor o celda vacía si no existe
        }
        row.appendChild(cell);
      });
      tableBody.appendChild(row);
    }
  });
}



  window.showForm = function(isEdit = false) {
    const filter = document.getElementById("filter").value;
    const formPopup = document.getElementById("formPopup");
    formPopup.style.display = "block";

    // Mostrar título correcto
    if (isEdit) {
        document.getElementById("formTitle").textContent = "Modificar Persona";
    } else {
        document.getElementById("formTitle").textContent = "Agregar Persona";
    }

    // Mostrar campos correspondientes al filtro seleccionado
    if (filter === "ciudadanos" || (filter === "all" && document.getElementById("dni").style.display === "block")) {
        document.getElementById("dni").style.display = "block";
        document.getElementById("paisOrigen").style.display = "none";
    } else if (filter === "extranjeros" || (filter === "all" && document.getElementById("paisOrigen").style.display === "block")) {
        document.getElementById("dni").style.display = "none";
        document.getElementById("paisOrigen").style.display = "block";
    } else {
        document.getElementById("dni").style.display = "none";
        document.getElementById("paisOrigen").style.display = "none";
    }

}


  // Función para cerrar el formulario
  window.closeForm = function() {
    document.getElementById("formPopup").style.display = "none";
    // Limpiar campos del formulario al cerrar
    document.getElementById("personForm").reset();
    editingId = null; // Resetear el ID de edición

    document.getElementById("dniLabel").style.display = "none";
    document.getElementById("paisOrigenLabel").style.display = "none";
  }

  document.getElementById("closeButton").addEventListener("click", closeForm);

  document.getElementById("personForm").addEventListener("submit", async function(event) {
    event.preventDefault();
  
    const formData = new FormData(event.target);
    const nombre = formData.get("nombre");
    const apellido = formData.get("apellido");
    const fechaNacimiento = formData.get("fechaNacimiento");
    const dni = formData.get("dni");
    const paisOrigen = formData.get("paisOrigen");
  
    // Validaciones
    if (!nombre.match(/^[a-zA-Z\s]*$/)) {
      alert("El nombre solo debe contener letras y espacios.");
      return;
    }
    
    if (!apellido.match(/^[a-zA-Z\s]*$/)) {
      alert("El apellido solo debe contener letras y espacios.");
      return;
    }
    
    const today = new Date();
    const selectedDate = new Date(fechaNacimiento);
    if (selectedDate >= today) {
      alert("La fecha de nacimiento debe ser anterior a la fecha actual.");
      return;
    }
    
    if (dni && (!(/^\d+$/.test(dni)) || dni <= 0)) {
      alert("El DNI debe ser un número mayor a cero.");
      return;
    }
  
    const newPerson = {
      id: editingId !== null ? editingId : Date.now(),
      nombre,
      apellido,
      fechaNacimiento: formatFechaNacimiento(fechaNacimiento),
      ...(dni ? { dni } : {}),
      ...(paisOrigen ? { paisOrigen } : {})
    };
  
    try {
      if (editingId !== null) {
        const personToUpdate = personas.find(person => person.id === editingId);
        if (personToUpdate) {
          document.getElementById("formPopup").style.display = "none";
          const updatedPersons = await editPersonPromise(personToUpdate, newPerson);
          personas = updatedPersons;
          updateTable();
        }
      } else {
        document.getElementById("formPopup").style.display = "none";
        spinner.style.display = "block";
        // Llamar a altaElemento para agregar un nuevo elemento
        const response = await altaElemento(newPerson);
        if (response === 'Exito') {   
          spinner.style.display = "none";   
          personas.push(newPerson);
          updateTable();
        }
      }
    } catch (error) {
      console.error(error.message);
      alert("Hubo un error al guardar los datos.");
    } finally {
      document.getElementById("personForm").reset();
      editingId = null;
    }
  });
  


window.showModifyForm = function(persona) {
  // Detectar tipo de persona para mostrar los campos correspondientes
  if (persona.dni) {
      document.getElementById("dniLabel").style.display = "block";
      document.getElementById("paisOrigen").style.display = "none";
  } else if (persona.paisOrigen) {
    console.log("Persona extranjera");
      document.getElementById("dni").style.display = "none";
      document.getElementById("paisOrigenLabel").style.display = "block";
  } else {
      document.getElementById("dni").style.display = "none";
      document.getElementById("paisOrigen").style.display = "none";
  }

  showForm(true); // Pasar true para indicar que es una modificación
  document.getElementById("nombre").value = persona.nombre;
  document.getElementById("apellido").value = persona.apellido;
  document.getElementById("fechaNacimiento").value = persona.fechaNacimiento;
  document.getElementById("dni").value = persona.dni || "";
  document.getElementById("paisOrigen").value = persona.paisOrigen || "";
  editingId = persona.id; // Almacenar el ID de la persona que se está editando
}


  // Función para confirmar la eliminación de una persona
  window.confirmDelete = function(id) {
    const confirmDeletion = confirm("¿Está seguro de que desea eliminar esta persona?");
    if (confirmDeletion) {
      console.log("voy a borrar el id: "+id);
      funcionEliminar(id);
      //personas = personas.filter(person => person.id !== id);
      updateTable();
    }
  }

  // Función para obtener el encabezado de columna adecuado para la tabla
  function getColumnHeader(column) {
    switch (column) {
      case "id":
        return "ID";
      case "nombre":
        return "Nombre";
      case "apellido":
        return "Apellido";
      case "fechaNacimiento":
        return "Fecha de Nacimiento";
      case "dni":
        return "DNI";
      case "paisOrigen":
        return "País de Origen";
      case "modify":
        return "Modificar";
      case "delete":
        return "Eliminar";
      default:
        return column;
    }
  }
});

// Función para eliminar una persona usando fetch
const funcionEliminar = async (id) => {
  const personToDelete = personas.find(
    (person) => person.id.toString() === id.toString()
  );

  const response = await callServiceFetchAsync(personToDelete, 'DELETE');

  if (response === 'Exito') {
    personas = personas.filter(
      (person) => person.id.toString() !== id.toString()
    );
    updateTable();
  }
};

// Función para llamar al servicio usando XMLHttpRequest
const callServiceXHR = (callback) => {
  const spinner = document.getElementById("spinner");
  spinner.style.display = "block"; // Mostrar el spinner al comenzar la solicitud

  const xhr = new XMLHttpRequest();
  xhr.open("GET", endpoint, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      spinner.style.display = "none"; // Ocultar el spinner al recibir la respuesta

      if (xhr.status == 200) {
        personas = JSON.parse(xhr.responseText);
        callback(); // Llamar a la función de callback después de obtener los datos
      } else {
        console.error("Error en la solicitud:", xhr.status);
      }
    }
  };
  xhr.send();
};

// Función para llamar al servicio usando fetch
const callServiceFetchAsync = async (data, method) => {
  spinner.style.display = "block";

  console.log(data);

  try {
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    spinner.style.display = "none"; // Ocultar el spinner al recibir la respuesta
    return 'Exito'; // Retornar 'Exito' si la operación se realiza correctamente
  } catch (error) {
    console.error('Error en la solicitud:', error);
    throw error; // Propagar el error para manejarlo externamente si es necesario
  } finally {
    spinner.style.display = "none"; // Asegurarse de ocultar el spinner al finalizar la solicitud, tanto si hay error como si no
  }
};

const editPersonPromise = (personToUpdate, newPersonData) => {
  const spinner = document.getElementById("spinner");
  spinner.style.display = "block";

  return new Promise((resolve, reject) => {
    callServiceFetchAsync(newPersonData, 'PUT')
      .then(response => {
        console.log(response);
        spinner.style.display = "none";

        if (response === 'Exito') {
          const updatedPersons = personas.map(person => person.id === personToUpdate.id ? newPersonData : person);
          resolve(updatedPersons);
        } else {
          reject(new Error('Error al editar persona en el servidor'));
        }
      })
      .catch(error => {
        spinner.style.display = "none";
        reject(error);
      });
  });
};


const altaElemento = async (data) => {
  try {
    // Validar que la fecha de nacimiento no sea mayor al día actual
    const fechaNacimiento = new Date(data.fechaNacimiento);
    const fechaActual = new Date();
    if (fechaNacimiento >= fechaActual) {
      throw new Error("La fecha de nacimiento debe ser anterior a la fecha actual.");
    }

    // Validar que nombre y apellido contengan solo letras y no estén vacíos
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.nombre.trim())) {
      throw new Error("El nombre sólo puede contener letras.");
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.apellido.trim())) {
      throw new Error("El apellido sólo puede contener letras.");
    }

    // Validar que DNI contenga solo números y sea mayor a cero si está presente
    if (data.dni && (!/^\d+$/.test(data.dni.trim()) || parseInt(data.dni.trim()) <= 0)) {
      throw new Error("El DNI debe contener sólo números mayores a cero.");
    }

    // Construir el objeto JSON a enviar, excluyendo el campo ID
    const requestData = {
      apellido: data.apellido.trim(),
      nombre: data.nombre.trim(),
      fechaNacimiento: (data.fechaNacimiento),
      ...(data.dni ? { dni: data.dni.trim() } : {}),
      ...(data.paisOrigen ? { paisOrigen: data.paisOrigen.trim() } : {})
    };

    console.log(requestData);

    // Realizar la llamada al servicio usando fetch
    const response = await callServiceFetchAsync(requestData, 'POST');

    return response; // Devolver la respuesta del servidor
  } catch (error) {
    console.error('Error en altaElemento:', error);
    throw error; // Propagar el error para manejarlo externamente si es necesario
  }
};


