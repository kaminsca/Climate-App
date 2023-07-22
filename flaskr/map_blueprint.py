import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)

from flaskr.db import get_db

bp = Blueprint('map', __name__, url_prefix='/')

@bp.route('/map', methods=('GET', 'POST'))
def register():
    if request.method == 'POST':
        print("post received")

    return render_template('maps/map.html')