# Use PyMySQL as a drop-in replacement for mysqlclient when the compiled
# MySQLdb module is not available (e.g. on shared hosting).
try:
    import MySQLdb  # noqa: F401
except ImportError:
    import pymysql

    pymysql.install_as_MySQLdb()
