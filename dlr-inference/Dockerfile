FROM amazon/aws-lambda-python:3.8

RUN pip3 install --upgrade pip
RUN pip3 install scikit-build wheel gluoncv 

RUN python -m pip install joblib awsiotsdk pandas
RUN yum install libglvnd-glx -y
RUN python -m pip install dlr
RUN pip3 install dlr==1.6.0

WORKDIR /var/task/dlr

COPY . .

#RUN pip install -r requirements.txt

ENTRYPOINT ["python3", "/var/task/dlr/main-test.py"]
