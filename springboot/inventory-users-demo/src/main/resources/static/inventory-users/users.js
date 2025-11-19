// Dummy data – you can replace with AJAX from Spring Boot later
let users = [
    { id: 1, name: "Bob", address: "Manila", age: 27 },
    { id: 2, name: "Harry", address: "Baguio", age: 32 }
];

const userTableBody = $("#userTable tbody");
const userCountLabel = $("#userCountLabel");

$(document).ready(function () {
    // Initial render
    users.forEach((u) => appendToUsrTable(u));
    updateUserCount();

    // Prevent default submit for all forms
    $("form").on("submit", function (e) {
        e.preventDefault();
    });

    // Add user form
    $("#addUser").on("submit", function () {
        const user = {};
        const nameInput = $('input[name="name"]').val().trim();
        const addressInput = $('input[name="address"]').val().trim();
        const ageInput = $('input[name="age"]').val().trim();

        if (nameInput && addressInput && ageInput) {
            $(this)
                .serializeArray()
                .map((data) => {
                    user[data.name] = data.value;
                });

            const lastId = users.length ? users[users.length - 1].id : 0;
            user.id = lastId + 1;
            user.age = Number(user.age);

            addUser(user);
            this.reset();
        } else {
            flashMessage("All fields must have a valid value.", "error");
        }
    });
});

function addUser(user) {
    users.push(user);
    appendToUsrTable(user);
    updateUserCount();
    flashMessage("User added successfully!", "success");
}

function editUser(id) {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    const modal = new bootstrap.Modal(document.getElementById("updateUserModal"));

    $(".modal-body").html(`
      <form id="updateUserForm">
        <div class="mb-3">
          <label class="form-label">Name</label>
          <input class="form-control form-control-sm" type="text" name="name" value="${user.name}" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Address</label>
          <input class="form-control form-control-sm" type="text" name="address" value="${user.address}" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Age</label>
          <input class="form-control form-control-sm" type="number" name="age" value="${user.age}" min="10" max="100" required />
        </div>
      </form>
  `);

    $(".modal-footer").html(`
      <button type="button" class="btn btn-neon btn-sm" id="saveUserBtn">
        <i class="fa-solid fa-floppy-disk me-1"></i> Save
      </button>
      <button type="button" class="btn btn-outline-light btn-sm" data-bs-dismiss="modal">
        Cancel
      </button>
  `);

    $("#saveUserBtn").on("click", function () {
        updateUser(id, modal);
    });

    modal.show();
}

function deleteUser(id) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const index = users.findIndex((u) => u.id === id);
    if (index !== -1) {
        users.splice(index, 1);
        $(`#user-${id}`).remove();
        updateUserCount();
        flashMessage("User deleted successfully!", "success");
    }
}

function updateUser(id, modalInstance) {
    const form = $("#updateUserForm");
    const name = form.find('input[name="name"]').val().trim();
    const address = form.find('input[name="address"]').val().trim();
    const age = Number(form.find('input[name="age"]').val().trim());

    if (!name || !address || !age) {
        flashMessage("All fields must have a valid value.", "error");
        return;
    }

    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return;

    users[index] = { id, name, address, age };

    const row = $(`#user-${id}`);
    row.find(".userName").text(name);
    row.find(".userAddress").text(address);
    row.find(".userAge").text(age);

    modalInstance.hide();
    flashMessage("User updated successfully!", "success");
}

function appendToUsrTable(user) {
    const rowHtml = `
    <tr id="user-${user.id}">
      <td class="userData userName">${user.name}</td>
      <td class="userData userAddress">${user.address}</td>
      <td class="userData userAge">${user.age}</td>
      <td class="text-center">
        <div class="d-flex justify-content-center gap-2">
          <button class="btn btn-action btn-edit" onclick="editUser(${user.id})">
            <i class="fa-solid fa-pen-to-square me-1"></i>Edit
          </button>
          <button class="btn btn-action btn-delete" onclick="deleteUser(${user.id})">
            <i class="fa-solid fa-trash-can me-1"></i>Delete
          </button>
        </div>
      </td>
    </tr>
  `;
    userTableBody.append(rowHtml);
}

function updateUserCount() {
    const count = users.length;
    if (count === 0) {
        userCountLabel.text("No users");
    } else if (count === 1) {
        userCountLabel.text("1 user");
    } else {
        userCountLabel.text(`${count} users`);
    }
}

function flashMessage(msg, type = "success") {
    const container = $("#flashContainer");
    container.empty();

    const cssClass = type === "success" ? "flashMsg-success" : "flashMsg-error";

    const html = `
    <div class="flashMsg ${cssClass}">
      <i class="fa-solid ${type === "success" ? "fa-circle-check" : "fa-triangle-exclamation"}"></i>
      <span>${msg}</span>
    </div>
  `;

    container.append(html);

    setTimeout(() => {
        container.fadeOut(200, function () {
            container.empty().show();
        });
    }, 2200);
}
