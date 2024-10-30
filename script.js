const apiUrl = 'https://fhir-bootcamp.medblocks.com/fhir/Patient';
let editingPatientId = null;

// Fetch and display the list of patients
async function getPatients() {
  try {let search_para = '?_sort=-_lastUpdated';
    const response = await axios.get(apiUrl);
    const patients = response.data.entry.map(entry => entry.resource);
    const tableBody = document.getElementById("patientTable");
    tableBody.innerHTML = "";

    patients.forEach(patient => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${patient.name[0].given[0]}</td>
        <td>${patient.birthDate}</td>
        <td>${patient.gender}</td>
        <td><button class="btn btn-primary" onclick="editPatient('${patient.id}')">Edit</button></td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
  }
}
/** /
// Calculate age from birthdate
function calculateAge(birthDate) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age--;
  return age;
}
*/

// Search patients by name or phone
function searchPatients() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#patientTable tr");
  rows.forEach(row => {
    const name = row.cells[0].textContent.toLowerCase();
    const phone = row.cells[3] && row.cells[3].textContent.toLowerCase();
    row.style.display = name.includes(query) || (phone && phone.includes(query)) ? "" : "none";
  });
}

// Edit a patient
async function editPatient(id) {
  try {
    const response = await axios.get(`${apiUrl}/${id}`);
    const patient = response.data;
    editingPatientId = patient.id;

    // Populate form fields with existing patient data
    document.getElementById("name").value = patient.name[0].given[0];
    document.getElementById("gender").value = patient.gender;
    document.getElementById("dob").value = patient.birthDate;
    document.getElementById("phone").value = patient.telecom[0].value;

    // Update form title and button text
    document.getElementById("formTitle").textContent = "Edit Patient";
    document.getElementById("submitButton").textContent = "Update Patient";

    window.location.href = "form.html";
  } catch (error) {
    console.error("Error editing patient:", error);
  }
}

// Submit the form to create or update a patient
async function submitForm(event) {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const gender = document.getElementById("gender").value;
  const birthDate = document.getElementById("dob").value;
  const phone = document.getElementById("phone").value;

  const patientData = {
    resourceType: "Patient",
    name: [{ text: name }],
    gender,
    birthDate,
    telecom: [{ system: "phone", value: phone }]
  };

  try {
    if (editingPatientId) {
      // Update existing patient
      await axios.put(`${apiUrl}/${editingPatientId}`, patientData);
      alert("Patient updated successfully");
    } else {
      // Create new patient
      await axios.post(apiUrl, patientData);
      alert("Patient added successfully");
    }

    editingPatientId = null; // Reset editing ID after submission
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error saving patient:", error);
  }
}

// Initialize the patient list on page load
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.endsWith("index.html")) {
    getPatients();
  } else if (window.location.pathname.endsWith("form.html")) {
    // Set up form for adding if not editing
    if (!editingPatientId) {
      document.getElementById("formTitle").textContent = "Add Patient";
      document.getElementById("submitButton").textContent = "Save";
    }
  }
});
