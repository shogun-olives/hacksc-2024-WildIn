from flask import Flask, render_template, redirect, url_for, jsonify, session, request
import config
import os

app = Flask(__name__)


# Home dir - automatically redirects to project_select
@app.route("/")
def home():
    return redirect(url_for("project_select"))
