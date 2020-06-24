const config = require('../config/core');
const fs = require('fs');
const path = require('path');
const crypto = require("crypto");
// var sqlite3 = require('sqlite3').verbose();
const caminte = require('caminte');
const Schema  = caminte.Schema;

// default driver
const caminteConfig = {
  driver     : "sqlite3",
  database   : config.DB_FILENAME
};
const schema = new Schema(caminteConfig.driver, caminteConfig);

const userModel = schema.define('users', {
    provider:     { type: schema.Text },
    username:     { type: schema.Text },
    displayName:  { type: schema.Text },
    profileUrl:   { type: schema.Text },
    permissions:  { type: schema.Text },
});

const fileModel = schema.define('files', {
    filename:     { type: schema.Text },
    originalname: { type: schema.Text },
    size:         { type: schema.Number },
    created:      { type: schema.Date,    default: Date.now },
});

// create the tables if they don't exist
schema.autoupdate(function() {
  console.log('sqlite3 database is ready')
})

/*
var db = new sqlite3.Database(config.DB_FILENAME);
db.exec('CREATE TABLE IF NOT EXISTS users (id integer primary key, provider text, username text, displayName text, profileUrl text, permissions text)');
db.run('CREATE TABLE IF NOT EXISTS files (id integer primary key, filename text unique, originalname text, size number, created datetime)', function() {
  db.all("PRAGMA table_info('files')", function(err, rows) {
    if (rows !== undefined && rows !== null) {
      var names = rows.map(function(val) {
          return val.name;
      });
      if (names.indexOf('created') == -1) {
        // Add creation date if we are at version 0, version 0 shouldn't have it.
        db.exec('ALTER TABLE files ADD COLUMN created datetime');
      }
    }
  });
});
*/


if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(searchString, position) {
        var subjectString = this.toString();
        if (position === undefined || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}

function generate_name(file, cb) {
    var ext = path.extname(file.originalname).toLowerCase();
    // Check if extension is a double-dot extension and, if true, override $ext
    var revname = reverse(file.originalname.toLowerCase());
    config.COMPLEX_EXTS.forEach(function(extension) {
        extension = reverse(extension.toLowerCase());
        if (revname.indexOf(extension) === 0) {
            ext = reverse(extension);
        }
    });

    function gen_name_internal() {
        var name = randomString(config.KEY_LENGTH);
        // Add the extension to the file name
        if (ext !== undefined && ext !== null && ext !== '')
            name = name + ext;
        /*
        // Check if a file with the same name does already exist in the database
        db.get('SELECT COUNT(name) FROM files WHERE filename = ?', name, function(err, row) {
            if (row === undefined || row === null || row['COUNT(name)'] === 0) {
                var now = Math.floor((new Date()).getTime()/1000);
                db.run('INSERT INTO files (originalname, filename, size, created) VALUES (?, ?, ?, ?)', [file.originalname, name, file.size, now]);
                cb(name);
            } else {
                console.warn("Name conflict! (" + name + ")");
                gen_name_internal();
            }
        });
        */
        fileModel.count({ where: { filename: name }}, function(err, fileCount) {
          if (err || fileCount === null || !fileCount) {
            // use it
            var now = Math.floor((new Date()).getTime()/1000);
            if (file.size === undefined) file.size = 0
            fileModel.create({
              originalname: file.originalname,
              filename:     name,
              size:         file.size,
              created:      now,
            }).then(function(created) {
              cb(name)
            })
          } else {
            console.warn("Name conflict! (" + name + ")");
            gen_name_internal();
          }
        });
    }
    gen_name_internal();
}

function setFileSize(filename, size) {
  fileModel.update({ where: { filename: filename }}, { size: size}, function (err, user) {
    if (err) console.error('setFileSize Err: ', err)
  })
}

function getUploads(since, callback) {
  console.log('getUploads - write me')
  //db.all('SELECT * FROM files WHERE datetime(created) > datetime(?);', [since], callback);
}

function deleteFile(id, callback) {
  console.log('deleteFile - write me')
  /*
    db.get('SELECT filename FROM files WHERE id = ?', id, function(err, row) {
        if (row && row.filename) {
            db.run('DELETE FROM files WHERE id = ?', id, function(err) {
                if (err) return callback(err);
                fs.unlink(path.join(config.UPLOAD_DIRECTORY, row.filename), callback);
            });
        } else {
            return callback(new Error('Failed to get the filename from the db'));
        }
    });
  */
}

function renameFile(id, newName, callback) {
  console.log('createOrGetUser - write me')
  /*
    db.get('SELECT * FROM files WHERE id = ?', id, function(err, row) {
        if (row && row.filename) {
            db.run('UPDATE files SET filename = ? WHERE id = ?', [newName, id], function(err) {
                if (err) return callback(err);
                fs.rename(path.join(config.UPLOAD_DIRECTORY, row.filename),
                    path.join(config.UPLOAD_DIRECTORY, newName), function(err) {
                        row.filename = newName;
                        callback(err, row);
                    });
            });
        } else {
            return callback(new Error('Failed to get the filename from the db'));
        }
    });
  */
}

function createOrGetUser(user, callback) {
  console.log('createOrGetUser - write me')
  /*
  db.all('SELECT * FROM users', [], function(err, rows) {
    if (err) console.error('A problem occurred getting the user!');
    if (rows === undefined || rows === null || rows.length === 0) {
      // If this is the first user, give them all permissions
      db.run('INSERT INTO users (id, provider, username, displayName, profileUrl, permissions) VALUES (?, ?, ?, ?, ?, ?)',
            [user.id, user.provider, user.username, user.displayName, user.profileUrl, '*']);
      user.permissions = '*';
      return callback(user);
    } else {
      // If the user is already in the DB return that one, otherwise create one with no permissions
      for (var i=0; i<rows.length; i++) {
        if (rows[i].id == user.id) return callback(rows[i]);
      }
      db.run('INSERT INTO users (id, provider, username, displayName, profileUrl, permissions) VALUES (?, ?, ?, ?, ?, ?)',
            [user.id, user.provider, user.username, user.displayName, user.profileUrl, '']);
      user.permissions = '';
      callback(user);
    }
  });
  */
}

function getAllUsers(callback) {
  console.log('getAllUsers - write me')
  //db.all('SELECT * FROM users', [], callback);
}

function setUserPermissions(id, permissions, callback) {
  console.log('setUserPermissions - write me')
  //db.run('UPDATE users SET permissions = ? WHERE id = ?', [permissions, id], callback);
}

function reverse(s) {
    var o = '';
    for (var i = s.length - 1; i >= 0; i--)
        o += s[i];
    return o;
}

function toObject(array) {
    return array.reduce(function(o, v, i) {
        o[i] = v;
        return o;
    }, {});
}

function randomString(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

function fileFilter(req, file, cb) {
    var found = false;
    var error = null;
    config.BANNED_EXTS.forEach(function(ext) {
        if (file.originalname.toLowerCase().endsWith(ext)) {
            found = true;
            error = new Error('File \'' + file.originalname + '\' uses a banned extension.');
            error.status = 403;
        }
    });

    return cb(error, !found);
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/kanri/login');
}

var exports = module.exports;
exports.reverse = reverse;
exports.toObject = toObject;
exports.fileFilter = fileFilter;
exports.generate_name = generate_name;
exports.setFileSize = setFileSize;
exports.ensureAuthenticated = ensureAuthenticated;
exports.createOrGetUser = createOrGetUser;
exports.getAllUsers = getAllUsers;
exports.getDatabase = function() {
  console.trace('getDatabase');
  return {
    userModel,
    fileModel,
  };
};
exports.getUploads = getUploads;
exports.renameFile = renameFile;
exports.deleteFile = deleteFile;
exports.setUserPermissions = setUserPermissions;
