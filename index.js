const inquirer = require('inquirer');
const { Client } = require('pg');

const client = new Client ({
    user: 'postgres',
    host: 'localhost',
    database: 'employee_db',
    password: 'password',
    port:3000,
});

client.connect();

const mainMenu = () => {
    inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Exit'
        ]
    }).then((answer) => {
        switch (answer.action) {
            case 'View all departments':
                viewAllDepartments();
                break;
            case 'View all roles':
                viewAllRoles();
                break;
            case 'View all employees':
                viewAllEmployees();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateEmployeeRole();
                break;
            case 'Exit':
                client.end();
                console.log('Goodbye!');
                break;
        }
    });
};

const viewAlllDepartments = () => {
    client.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        mainMenu();
    }); 
};

const viewAllRoles = () => {
    const query = `
    Select role.id, role.title, role.salary, department.name AS department
    FROM role
    JOIN department on role.department_id = department.id
    `;
    client.query(query, (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        mainMenu();
    });
};
{
    const query = `
    Select `
}