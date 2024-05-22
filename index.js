const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const inquirer = require('inquirer');

const dbConfig = new Client ({
    user: 'postgres',
    host: 'localhost',
    database: 'employee_db',
    password: 'password',
    port:5432,
});



const runSQLFile = async (client, filePath) => {
    const sql = fs.readFileSync(path.join(__dirname, filePath)).toString();
    try {
        await client.query(sql);
    } catch (err) {
        console.error(`Error executing SQL file ${filePath}:`, err);
    }
};

const createDatabase = async () => {
    const tempClient = new Client( {...dbConfig, database: 'postgres'}); // Connect to default 'postgres' database
    await tempClient.connect();
    await runSQLFile(tempClient, 'db/create_database.sql');
    await tempClient.end();
};

const initializeDatabase = async () => {
    await runSQLFile('db/schema.sql');
    await runSQLFile('db/seeds.sql');
};

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

const viewAllDepartments = () => {
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

const viewAllEmployees = () => {
    const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary,
    (SELECT first_name || ' ' || last_name FROM employee WHERE id = employee.manager_id) AS manager
     FROM employee
     JOIN role ON employee.role_id = role.id
     JOIN department ON role.department_id = department.id
    `;
    client.query(query, (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        mainMenu();
    });
};

const addDepartment = () => {
    inquirer.prompt({
        name:'name',
        type: 'input',
        message: 'Enter the name of the pepartment:'
    }).then((answer) => {
        client.query('INSERT INTO department (name) VALUES ($1)', [answer.name], (err, res) => {
            if (err) throw err;
            console.log('Department added!');
            mainMenu();
        });
        
    });
};

const addRole = () => {
    inquirer.prompt([
        {
            name: 'title',
            type: 'input',
            message: 'Enter the role title:'
        },
        {
            name: 'salary',
            type: 'input',
            message: 'Enter the salary for this role:'
        },
        {
            name: 'department_id',
            type: 'input',
            message: 'Enter the department ID for this role:'
        }
    ]).then((answers) => {
        client.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [answers.title, answers.salary, answers.department_id], (err, res) => {
            if (err) throw err;
            console.log('Role added!');
            mainMenu();  
        });
    });
};

const addEmployee = () => {
    inquirer.prompt([
        {
            name: 'first_name',
            type: 'input',
            message: 'Enter the first name:'
        },
        {
            name: 'last_name',
            type: 'input',
            message: 'Enter the last name:'
        },
        {
            name: 'role_id',
            type: 'input',
            message: 'Enter the role ID:'
        },
        {
            name: 'manager_id',
            type: 'input',
            message: 'Enter the manager ID (or leave blank if none):',
            default: null
        }
    ]).then((answers) => {
        client.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [answers.first_name, answers.last_name, answers.role_id, answers.manager_id], (err, res) => {
            if (err) throw err;
            console.log('Employee added!');
            mainMenu();
        });
    });
};

const updateEmployeeRole = () => {
    inquirer.prompt([
        {
            name: 'employee_id',
            type: 'input',
            message: 'Enter the employee ID to update:'
        },
        {
            name: 'new_role_id',
            type: 'input',
            message: 'Enter the new role ID:'
        }
    ]).then((answers) => {
        client.query('UPDATE employee SET role_id = $1 WHERE id = $2', [answers.new_role_id, answers.employee_id], (err, res) => {
            if (err) throw err;
            console.log('Employee role updated!');
            mainMenu();
        });
    });
};

const startApp = async () => {
    await createDatabase();
    await client.connect();
    await initializeDatabase();
    mainMenu();
};

startApp();